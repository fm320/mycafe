import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_CAFE_CONFIG,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_WHATSAPP_MESSAGES
} from "../services/mockData";
import { processWhatsappMessage } from "../services/whatsappBotService";

const CafeContext = createContext(null);

export const CafeProvider = ({ children }) => {
  // Load state from localStorage or fallback to defaults
  const [cafeConfig, setCafeConfig] = useState(() => {
    const saved = localStorage.getItem("cafe_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.currency === "$" || !parsed.currency) {
        parsed.currency = "₹";
        parsed.taxRate = 5.0;
      }
      return parsed;
    }
    return INITIAL_CAFE_CONFIG;
  });

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  const [menuItems, setMenuItems] = useState(() => {
    const savedConfig = localStorage.getItem("cafe_config");
    const isOldCurrency = savedConfig && JSON.parse(savedConfig).currency === "$";
    const saved = localStorage.getItem("cafe_menu_items");
    if (saved && !isOldCurrency) {
      const parsed = JSON.parse(saved);
      // Check if items have old dollar prices (< 50)
      if (parsed.some(i => i.price < 50)) {
        return INITIAL_MENU_ITEMS;
      }
      return parsed;
    }
    return INITIAL_MENU_ITEMS;
  });

  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem("cafe_tables");
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [orders, setOrders] = useState(() => {
    const savedConfig = localStorage.getItem("cafe_config");
    const isOldCurrency = savedConfig && JSON.parse(savedConfig).currency === "$";
    const saved = localStorage.getItem("cafe_orders");
    if (saved && !isOldCurrency) {
      const parsed = JSON.parse(saved);
      if (parsed.some(o => o.total < 100)) {
        return INITIAL_ORDERS;
      }
      return parsed;
    }
    return INITIAL_ORDERS;
  });

  const [whatsappMessages, setWhatsappMessages] = useState(() => {
    const savedConfig = localStorage.getItem("cafe_config");
    const isOldCurrency = savedConfig && JSON.parse(savedConfig).currency === "$";
    const saved = localStorage.getItem("cafe_whatsapp_messages");
    if (saved && !isOldCurrency) {
      const parsed = JSON.parse(saved);
      if (parsed.some(m => m.text.includes("$"))) {
        return INITIAL_WHATSAPP_MESSAGES;
      }
      return parsed;
    }
    return INITIAL_WHATSAPP_MESSAGES;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("cafe_config", JSON.stringify(cafeConfig));
  }, [cafeConfig]);

  useEffect(() => {
    localStorage.setItem("cafe_menu_items", JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem("cafe_tables", JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem("cafe_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("cafe_whatsapp_messages", JSON.stringify(whatsappMessages));
  }, [whatsappMessages]);

  // Audio synthesizer for KDS kitchen alerts
  const playKitchenChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log("Audio feedback disabled or restricted by browser", e);
    }
  };

  // Add new order
  const addOrder = (newOrderData) => {
    const orderId = `ord-${100 + orders.length + 1}`;
    const newOrder = {
      id: orderId,
      customerName: newOrderData.customerName || "Walk-in Guest",
      customerPhone: newOrderData.customerPhone || "+15550000000",
      orderType: newOrderData.orderType || "Dine-In",
      tableNumber: newOrderData.tableNumber || null,
      status: "New", // New -> Preparing -> Ready -> Delivered
      paymentStatus: newOrderData.paymentStatus || "Unpaid",
      paymentMethod: newOrderData.paymentMethod || "Cash",
      createdAt: new Date().toISOString(),
      source: newOrderData.source || "Customer App",
      items: newOrderData.items || [],
      subtotal: newOrderData.subtotal || 0,
      tax: newOrderData.tax || 0,
      total: newOrderData.total || 0
    };

    setOrders((prev) => [newOrder, ...prev]);
    playKitchenChime();

    // If table number specified, occupy table
    if (newOrder.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.number === parseInt(newOrder.tableNumber, 10)
            ? { ...t, status: "occupied", currentOrderId: orderId, seatedTime: new Date().toISOString() }
            : t
        )
      );
    }

    return newOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // If delivered and dine-in, check if we should auto-vacate table
    if (newStatus === "Delivered") {
      const order = orders.find((o) => o.id === orderId);
      if (order && order.tableNumber) {
        setTables((prev) =>
          prev.map((t) =>
            t.number === parseInt(order.tableNumber, 10)
              ? { ...t, status: "available", currentOrderId: null, seatedTime: null }
              : t
          )
        );
      }
    }
  };

  // Update payment status
  const updatePaymentStatus = (orderId, paymentStatus, paymentMethod) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, paymentStatus, paymentMethod: paymentMethod || o.paymentMethod }
          : o
      )
    );
  };

  // Table management
  const setTableStatus = (tableNumber, status) => {
    setTables((prev) =>
      prev.map((t) => (t.number === tableNumber ? { ...t, status } : t))
    );
  };

  // Menu Management CRUD
  const addMenuItem = (item) => {
    const newItem = { ...item, id: `m_${Date.now()}` };
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const updateMenuItem = (id, updatedFields) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteMenuItem = (id) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  // WhatsApp Simulator Interaction
  const sendWhatsappMessage = (userText) => {
    const userMsg = {
      id: `w_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toISOString()
    };

    setWhatsappMessages((prev) => [...prev, userMsg]);

    // Process Bot Response
    setTimeout(() => {
      const botResult = processWhatsappMessage(userText, menuItems, cafeConfig, orders);

      // If bot result created an order
      if (botResult.type === "create_order" && botResult.orderData) {
        const createdOrder = addOrder(botResult.orderData);
        botResult.text = botResult.text.replace("#ORDER_ID", createdOrder.id);
      }

      const botMsg = {
        id: `w_bot_${Date.now()}`,
        sender: "bot",
        text: botResult.text,
        timestamp: new Date().toISOString()
      };

      setWhatsappMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const clearWhatsappChat = () => {
    setWhatsappMessages(INITIAL_WHATSAPP_MESSAGES);
  };

  const updateCafeConfig = (newConfig) => {
    setCafeConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return (
    <CafeContext.Provider
      value={{
        cafeConfig,
        updateCafeConfig,
        categories,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        tables,
        setTableStatus,
        orders,
        addOrder,
        updateOrderStatus,
        updatePaymentStatus,
        whatsappMessages,
        sendWhatsappMessage,
        clearWhatsappChat,
        playKitchenChime
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) throw new Error("useCafe must be used within a CafeProvider");
  return context;
};
