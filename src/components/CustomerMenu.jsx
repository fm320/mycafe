import React, { useState } from "react";
import { Search, Filter, Plus, ShoppingCart, Sparkles, Coffee, Flame, Check, HelpCircle } from "lucide-react";
import { useCafe } from "../context/CafeContext";
import CustomizationModal from "./CustomizationModal";
import OrderTrackerModal from "./OrderTrackerModal";

export default function CustomerMenu() {
  const { cafeConfig, categories, menuItems, addOrder } = useCafe();

  const [selectedTable, setSelectedTable] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPopular, setFilterPopular] = useState(false);
  const [filterVeg, setFilterVeg] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modal States
  const [customizingItem, setCustomizingItem] = useState(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);

  // Add item to cart
  const handleAddToCart = (customizedItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.id === customizedItem.id && i.customization === customizedItem.customization
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += customizedItem.quantity;
        return updated;
      }
      return [...prev, customizedItem];
    });
  };

  const updateCartQuantity = (index, delta) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity += delta;
      if (updated[index].quantity <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      return updated;
    });
  };

  // Compute Cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = (subtotal * cafeConfig.taxRate) / 100;
  const total = subtotal + tax;

  // Handle Checkout & Submit Order
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const orderData = {
      customerName: `Guest (Table ${selectedTable})`,
      customerPhone: "+15550190000",
      orderType: "Dine-In",
      tableNumber: selectedTable,
      items: cart,
      subtotal,
      tax,
      total,
      paymentStatus: "Unpaid",
      paymentMethod: "Pay at Counter / UPI",
      source: "QR Self-Order"
    };

    const createdOrder = addOrder(orderData);
    setCart([]);
    setIsCartOpen(false);
    setActiveTrackingOrderId(createdOrder.id);
  };

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPopular = !filterPopular || item.popular;
    const matchesVeg = !filterVeg || item.veg;
    return matchesCategory && matchesSearch && matchesPopular && matchesVeg;
  });

  return (
    <div className="min-h-screen pb-28">
      {/* Hero Banner & Table Selector */}
      <div className="relative bg-gradient-to-b from-[#261d1c] via-[#1a1415] to-[#0f0d0e] pt-6 pb-8 px-4 border-b border-amber-950/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Direct Digital Table Ordering
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Crafted Coffee & Fine Delights
            </h2>
            <p className="text-sm text-zinc-400 max-w-lg">
              {cafeConfig.tagline}
            </p>
          </div>

          {/* QR Table selector dropdown */}
          <div className="bg-[#1e181a] border border-amber-900/30 rounded-2xl p-4 shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              #{selectedTable}
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-semibold block">Your Table Number</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
              >
                {Array.from({ length: cafeConfig.tableCount }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-zinc-900 text-white">
                    Table #{i + 1} (Dine-In)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search coffee, croissants, Matcha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181415] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterPopular(!filterPopular)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                filterPopular
                  ? "bg-amber-500/20 text-amber-300 border-amber-500"
                  : "bg-[#181415] text-zinc-400 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Popular
            </button>
            <button
              onClick={() => setFilterVeg(!filterVeg)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                filterVeg
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                  : "bg-[#181415] text-zinc-400 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              🌱 Vegetarian
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
              selectedCategory === "all"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                : "bg-[#181415] text-zinc-300 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                  : "bg-[#181415] text-zinc-300 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#161214] border border-zinc-800/80 rounded-2xl p-6">
            <Coffee className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No items found</h3>
            <p className="text-xs text-zinc-400 mt-1">Try adjusting your search query or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#181415] border border-amber-900/15 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 flex flex-col group"
              >
                {/* Item Image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181415] via-transparent to-transparent"></div>
                  
                  {item.popular && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider shadow-md">
                      ★ Bestseller
                    </span>
                  )}

                  <span className="absolute bottom-2.5 right-3 text-lg font-extrabold text-amber-400 font-mono">
                    {cafeConfig.currency}{item.price.toFixed(2)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setCustomizingItem(item)}
                    className="w-full bg-zinc-900 hover:bg-amber-500 text-zinc-200 hover:text-slate-950 border border-zinc-800 hover:border-amber-500 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Customize & Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40">
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-2xl shadow-amber-600/30 flex items-center justify-between border border-amber-400/40 animate-slideUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-extrabold text-sm">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
                  Table #{selectedTable} Order
                </span>
                <span className="text-lg font-black font-mono leading-none">
                  {cafeConfig.currency}{total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
            >
              <ShoppingCart className="w-4 h-4" /> View Cart & Order
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1a1618] border-l border-amber-900/30 w-full max-w-md h-full flex flex-col justify-between shadow-2xl">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Your Cart (Table #{selectedTable})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-xs">{item.name}</h4>
                    {item.customization && (
                      <p className="text-[11px] text-amber-400/90 mt-0.5">{item.customization}</p>
                    )}
                    <span className="text-xs font-mono text-zinc-400 mt-1 block">
                      {cafeConfig.currency}{item.price.toFixed(2)} x {item.quantity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => updateCartQuantity(idx, -1)}
                      className="text-zinc-400 hover:text-white px-1 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(idx, 1)}
                      className="text-amber-400 hover:text-amber-300 px-1 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary & Order Button */}
            <div className="p-5 border-t border-zinc-800 bg-[#141012] space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{cafeConfig.currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({cafeConfig.taxRate}%)</span>
                  <span className="font-mono text-white">{cafeConfig.currency}{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Amount</span>
                  <span className="font-mono text-amber-400 text-base">{cafeConfig.currency}{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-sm transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                Confirm Order for Table #{selectedTable}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Live Order Tracker Modal */}
      {activeTrackingOrderId && (
        <OrderTrackerModal
          orderId={activeTrackingOrderId}
          onClose={() => setActiveTrackingOrderId(null)}
        />
      )}
    </div>
  );
}
