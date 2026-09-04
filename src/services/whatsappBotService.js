/**
 * WhatsApp Bot Engine & Parser Service
 * Handles NLP keyword parsing, automatic order generation, and dynamic wa.me direct links.
 */

export const processWhatsappMessage = (inputMessage, menuItems, cafeConfig, orders) => {
  const rawText = inputMessage.trim();
  const text = rawText.toLowerCase();
  const currency = cafeConfig?.currency || "₹";

  // 1. Menu request
  if (text.includes("menu") || text === "1" || text.includes("card") || text.includes("list") || text.includes("items")) {
    const formattedMenu = menuItems.map(item => 
      `• *${item.name}* - ${currency}${item.price.toFixed(2)}\n  _${item.description.slice(0, 50)}..._`
    ).join("\n\n");

    return {
      type: "menu",
      text: `☕ *${cafeConfig.name.toUpperCase()} MENU* ☕\n\n${formattedMenu}\n\n👉 *To place an order via WhatsApp, reply:* \n"Order [Item Name] for Table [Number]"\nExample: _Order 2 Cappuccino for Table 4_`
    };
  }

  // 2. Order request parsing (e.g. "Order 2 Cappuccino for Table 4" or "Table 2 ke liye 1 Latte")
  const isOrderIntent = text.startsWith("order") || 
                        text.includes("table") || 
                        text.includes("want") || 
                        text.includes("bring") || 
                        text.includes("chai") || 
                        text.includes("coffee") || 
                        text.includes("latte") || 
                        text.includes("cappuccino") || 
                        text.includes("croissant") || 
                        text.includes("toast") ||
                        text.includes("tart");

  if (isOrderIntent) {
    // Try to extract table number
    const tableMatch = text.match(/table\s*#?\s*(\d+)/i) || 
                       text.match(/t\s*#?\s*(\d+)/i) || 
                       text.match(/tb\s*#?\s*(\d+)/i) ||
                       text.match(/(\d+)\s*number?\s*table/i);
    const tableNumber = tableMatch ? parseInt(tableMatch[1], 10) : 1;

    // Clean text by stripping table references to avoid quantity confusion
    const cleanedText = text.replace(/table\s*#?\s*\d+/gi, '')
                            .replace(/t\s*#?\s*\d+/gi, '')
                            .replace(/tb\s*#?\s*\d+/gi, '');

    // Match items in menu
    const itemsFound = [];

    menuItems.forEach(menuItem => {
      const itemNameLower = menuItem.name.toLowerCase();
      // Extract key words from item name (ignoring common words like "and", "classic", "with")
      const words = itemNameLower.split(" ").filter(w => w.length > 2);
      
      const matched = text.includes(itemNameLower) || words.some(word => cleanedText.includes(word));

      if (matched) {
        // Try to find quantity preceding or following the matched item
        // e.g. "2 cappuccino" or "latte 2" or "2x latte"
        let qty = 1;
        const mainWord = words.find(w => cleanedText.includes(w)) || words[0];
        
        const qtyPrecedingMatch = cleanedText.match(new RegExp(`(\\d+)\\s*(x\\s*)?${mainWord}`, "i"));
        const qtyFollowingMatch = cleanedText.match(new RegExp(`${mainWord}\\s*(x\\s*)?(\\d+)`, "i"));

        if (qtyPrecedingMatch) {
          qty = parseInt(qtyPrecedingMatch[1], 10);
        } else if (qtyFollowingMatch) {
          qty = parseInt(qtyFollowingMatch[2], 10);
        } else {
          // General number scan if only 1 number present in cleaned text
          const numbersInCleaned = cleanedText.match(/(\d+)/);
          if (numbersInCleaned) {
            qty = parseInt(numbersInCleaned[1], 10);
          }
        }

        // Avoid adding duplicates
        if (!itemsFound.some(i => i.id === menuItem.id)) {
          itemsFound.push({
            ...menuItem,
            quantity: Math.max(1, qty),
            customization: "Standard Brew"
          });
        }
      }
    });

    if (itemsFound.length > 0) {
      const subtotal = itemsFound.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const taxRate = cafeConfig.taxRate || 5.0;
      const tax = (subtotal * taxRate) / 100;
      const total = subtotal + tax;

      return {
        type: "create_order",
        orderData: {
          customerName: "WhatsApp Guest",
          customerPhone: "+91 98765 43210",
          orderType: "Dine-In",
          tableNumber: tableNumber,
          items: itemsFound,
          subtotal,
          tax,
          total,
          paymentStatus: "Paid",
          paymentMethod: "WhatsApp Pay (UPI)",
          source: "WhatsApp Bot"
        },
        text: `🎉 *ORDER CONFIRMED!* (#ORDER_ID)\n\n📍 *Table:* ${tableNumber}\n📋 *Items:* \n${itemsFound.map(i => `• ${i.quantity}x ${i.name} (${currency}${(i.price * i.quantity).toFixed(2)})`).join("\n")}\n\n💵 *Total:* ${currency}${total.toFixed(2)} (GST Included)\n💳 *Payment:* Auto-charged via WhatsApp UPI\n\nYour order has been sent to our kitchen! We will notify you when it's ready. ⚡`
      };
    } else if (text.startsWith("order")) {
      return {
        type: "unknown_order",
        text: `🤔 I couldn't recognize the item name in your order.\n\nType *MENU* to see available items, or try:\n_"Order 1 Smokey Velvet Latte for Table ${tableNumber}"_`
      };
    }
  }

  // 3. Status lookup
  if (text.includes("status") || text.includes("track") || text === "3" || text.includes("order status")) {
    const activeOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled");
    if (activeOrders.length === 0) {
      return {
        type: "status",
        text: "ℹ️ You currently have no active orders in preparation. Type *MENU* to place a new order!"
      };
    }

    const latestOrder = activeOrders[0];
    const statusIcons = {
      New: "⏳ Order Received",
      Preparing: "👨‍🍳 Cooking in Kitchen",
      Ready: "🔔 Ready for Pick Up / Serving!"
    };

    return {
      type: "status",
      text: `🔎 *ORDER STATUS* (#${latestOrder.id})\n\n📍 Table: ${latestOrder.tableNumber || "Takeaway"}\n📊 Status: *${statusIcons[latestOrder.status] || latestOrder.status}*\n⏰ Placed: ${new Date(latestOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n_Thank you for dining with ${cafeConfig.name}!_`
    };
  }

  // 4. Reservation request
  if (text.includes("reserve") || text.includes("book") || text === "4" || text.includes("table book")) {
    return {
      type: "reservation",
      text: `🪑 *TABLE RESERVATION*\n\nTo reserve a table, please reply:\n"Reserve [Name] for [N] people at [Time]"\n\nExample: _Reserve Rahul for 4 people at 7:00 PM_`
    };
  }

  // 5. Default fallback
  return {
    type: "fallback",
    text: `${cafeConfig.whatsappBot?.greeting || "Hello! Type MENU to get started."}`
  };
};

/**
 * Generate Direct WhatsApp wa.me Link for instant messaging
 */
export const createWhatsappShareLink = (phone, messageText) => {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};

/**
 * Format invoice receipt as WhatsApp message
 */
export const formatReceiptForWhatsapp = (order, cafeConfig) => {
  const currency = cafeConfig?.currency || "₹";
  return `🧾 *INVOICE RECEIPT - ${cafeConfig.name.toUpperCase()}*\n` +
    `----------------------------------------\n` +
    `Order ID: #${order.id}\n` +
    `Date: ${new Date(order.createdAt).toLocaleString()}\n` +
    `Type: ${order.orderType} ${order.tableNumber ? `(Table ${order.tableNumber})` : ''}\n` +
    `Customer: ${order.customerName}\n` +
    `----------------------------------------\n` +
    `ITEMS:\n` +
    order.items.map(item => `${item.quantity}x ${item.name} - ${currency}${(item.price * item.quantity).toFixed(2)}`).join('\n') +
    `\n----------------------------------------\n` +
    `Subtotal: ${currency}${order.subtotal.toFixed(2)}\n` +
    `Tax (${cafeConfig.taxRate}%): ${currency}${order.tax.toFixed(2)}\n` +
    `*TOTAL: ${currency}${order.total.toFixed(2)}*\n` +
    `Payment Status: *${order.paymentStatus} (${order.paymentMethod})*\n` +
    `----------------------------------------\n` +
    `Thank you for visiting ${cafeConfig.name}! ☕`;
};
