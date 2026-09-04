import React, { useState } from "react";
import { Search, Plus, Trash2, CreditCard, QrCode, Banknote, Receipt, CheckCircle, Coffee, Filter } from "lucide-react";
import { useCafe } from "../context/CafeContext";
import TableMap from "./TableMap";
import ReceiptModal from "./ReceiptModal";

export default function PosBilling() {
  const { cafeConfig, menuItems, categories, orders, addOrder, updatePaymentStatus } = useCafe();

  const [selectedTableNum, setSelectedTableNum] = useState(1);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("Dine-In");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Payment Modal & Receipt States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI QR");
  const [createdReceiptOrder, setCreatedReceiptOrder] = useState(null);

  // Add item to POS cart
  const handleAddItemToCart = (menuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...menuItem, quantity: 1, customization: "Standard" }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = (subtotal * cafeConfig.taxRate) / 100;
  const total = subtotal + tax;

  // Process POS Order
  const handleCompleteOrder = () => {
    if (cart.length === 0) return;

    const orderData = {
      customerName: customerName || `Table ${selectedTableNum} Guest`,
      customerPhone: customerPhone || "+15550190000",
      orderType: orderType,
      tableNumber: orderType === "Dine-In" ? selectedTableNum : null,
      items: cart,
      subtotal,
      tax,
      total,
      paymentStatus: "Paid",
      paymentMethod: paymentMethod,
      source: "POS Counter"
    };

    const newOrder = addOrder(orderData);
    setCreatedReceiptOrder(newOrder);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setShowPaymentModal(false);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      
      {/* Visual Table Layout */}
      <TableMap selectedTableNum={selectedTableNum} onSelectTable={setSelectedTableNum} />

      {/* Main Billing Split: Item Picker (Left) & Active Bill Cart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Quick Item Selector Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-4 space-y-4">
            
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search POS items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === "all"
                      ? "bg-amber-500 text-slate-950"
                      : "bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === c.id
                        ? "bg-amber-500 text-slate-950"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Item Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddItemToCart(item)}
                  className="p-3 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-amber-500/50 rounded-xl text-left transition flex flex-col justify-between group h-28"
                >
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 capitalize block mt-0.5">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {cafeConfig.currency}{item.price.toFixed(2)}
                    </span>
                    <div className="w-6 h-6 rounded-md bg-amber-500/20 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 flex items-center justify-center transition">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Right: Cashier Terminal & Bill Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-4 flex flex-col h-full justify-between">
            
            {/* Header & Order Type Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">Active Ticket</h3>
                  <p className="text-xs text-zinc-400">Table #{selectedTableNum}</p>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => setOrderType("Dine-In")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      orderType === "Dine-In"
                        ? "bg-amber-500 text-slate-950"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Dine-In
                  </button>
                  <button
                    onClick={() => setOrderType("Takeaway")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      orderType === "Takeaway"
                        ? "bg-amber-500 text-slate-950"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Takeaway
                  </button>
                </div>
              </div>

              {/* Guest Phone & Name Input */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Guest Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="WhatsApp Mobile (+1...)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto space-y-2 py-2 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 space-y-2">
                  <Coffee className="w-8 h-8 mx-auto text-zinc-600" />
                  <p className="text-xs">No items added to this bill yet</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-xs">{item.name}</h4>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {cafeConfig.currency}{item.price.toFixed(2)} x {item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals & Checkout Button */}
            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <div className="space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{cafeConfig.currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({cafeConfig.taxRate}%)</span>
                  <span className="font-mono text-white">{cafeConfig.currency}{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-1.5 border-t border-zinc-800">
                  <span>Grand Total</span>
                  <span className="font-mono text-amber-400 text-base">{cafeConfig.currency}{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Charge {cafeConfig.currency}{total.toFixed(2)}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* POS Payment Modal (UPI / Card / Cash) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1a1618] border border-amber-900/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Select Payment Method</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-xs text-zinc-400 block uppercase">Amount Due</span>
              <span className="text-3xl font-black font-mono text-amber-400">{cafeConfig.currency}{total.toFixed(2)}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("UPI QR")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                  paymentMethod === "UPI QR"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <QrCode className="w-5 h-5" /> UPI QR Code
              </button>

              <button
                onClick={() => setPaymentMethod("Credit Card")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                  paymentMethod === "Credit Card"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <CreditCard className="w-5 h-5" /> Card / POS
              </button>

              <button
                onClick={() => setPaymentMethod("Cash")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                  paymentMethod === "Cash"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <Banknote className="w-5 h-5" /> Cash Payment
              </button>
            </div>

            {/* Dynamic UPI QR Display */}
            {paymentMethod === "UPI QR" && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center space-y-2">
                <div className="w-36 h-36 bg-white p-2 mx-auto rounded-lg shadow-inner flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=aroma.cafe@upi%26pn=Aroma%20Reserve%26am=${total.toFixed(2)}`}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-zinc-400">Scan using GPay, PhonePe, Paytm, or WhatsApp Pay</p>
              </div>
            )}

            <button
              onClick={handleCompleteOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Confirm Payment & Issue Receipt
            </button>
          </div>
        </div>
      )}

      {/* Generated Receipt Printable Modal */}
      {createdReceiptOrder && (
        <ReceiptModal
          order={createdReceiptOrder}
          onClose={() => setCreatedReceiptOrder(null)}
        />
      )}
    </div>
  );
}
