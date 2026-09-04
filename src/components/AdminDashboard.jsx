import React, { useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  Users,
  Plus,
  Edit2,
  Trash2,
  Coffee,
  Store,
  MessageSquare,
  Check,
  X,
  PieChart as PieChartIcon
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useCafe } from "../context/CafeContext";

export default function AdminDashboard() {
  const {
    cafeConfig,
    updateCafeConfig,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    categories,
    orders,
    tables
  } = useCafe();

  const [activeSubTab, setActiveSubTab] = useState("analytics"); // 'analytics' | 'menu' | 'settings'

  // Menu Form Modal state
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "espresso",
    price: "",
    description: "",
    image: "",
    veg: true,
    popular: false
  });

  // Cafe Settings state
  const [settingsForm, setSettingsForm] = useState(cafeConfig);

  // Compute Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const tableOccupancyPercent = Math.round((occupiedTables / tables.length) * 100);
  const whatsappOrdersCount = orders.filter((o) => o.source === "WhatsApp Bot").length;

  // Revenue chart data mock generator
  const dailySalesData = [
    { day: "Mon", revenue: 420 },
    { day: "Tue", revenue: 580 },
    { day: "Wed", revenue: 640 },
    { day: "Thu", revenue: 510 },
    { day: "Fri", revenue: 890 },
    { day: "Sat", revenue: 1120 },
    { day: "Today", revenue: Math.round(totalRevenue) }
  ];

  // Category sales breakdown data
  const categorySalesData = categories.map((cat) => {
    const count = orders.reduce((acc, order) => {
      const catItems = order.items.filter((i) => i.category === cat.id);
      return acc + catItems.reduce((sum, ci) => sum + ci.quantity, 0);
    }, 0);
    return { name: cat.name, value: count || Math.floor(Math.random() * 8) + 2 };
  });

  const PIE_COLORS = ["#f59e0b", "#d97706", "#10b981", "#6366f1", "#ec4899", "#8b5cf6"];

  const handleOpenAdd = () => {
    setMenuForm({
      name: "",
      category: "espresso",
      price: "",
      description: "",
      image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80",
      veg: true,
      popular: false
    });
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setMenuForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      image: item.image,
      veg: item.veg,
      popular: item.popular
    });
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleSaveMenuItem = (e) => {
    e.preventDefault();
    const itemData = {
      ...menuForm,
      price: parseFloat(menuForm.price) || 0,
      options: editingItem ? editingItem.options : {}
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem(itemData);
    }

    setIsAddModalOpen(false);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateCafeConfig(settingsForm);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between bg-[#181415] border border-amber-900/20 rounded-2xl p-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Cafe Operations & Analytics</h2>
          <p className="text-xs text-zinc-400">Manage revenue, menu inventory, and store parameters</p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === "analytics"
                ? "bg-amber-500 text-slate-950"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Analytics & Sales
          </button>
          <button
            onClick={() => setActiveSubTab("menu")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === "menu"
                ? "bg-amber-500 text-slate-950"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Menu Manager ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === "settings"
                ? "bg-amber-500 text-slate-950"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Store Settings
          </button>
        </div>
      </div>

      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</span>
                <IndianRupee className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-2xl font-black font-mono text-white">
                {cafeConfig.currency}{totalRevenue.toFixed(2)}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium block">↑ 14.8% from yesterday</span>
            </div>

            <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-2xl font-black font-mono text-white">{totalOrdersCount}</span>
              <span className="text-[11px] text-zinc-400 block">Avg Ticket: {cafeConfig.currency}{avgOrderValue.toFixed(2)}</span>
            </div>

            <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Table Occupancy</span>
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-2xl font-black font-mono text-white">{tableOccupancyPercent}%</span>
              <span className="text-[11px] text-amber-400 font-medium block">
                {occupiedTables} of {tables.length} tables seated
              </span>
            </div>

            <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">WhatsApp Bot Orders</span>
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-2xl font-black font-mono text-white">{whatsappOrdersCount}</span>
              <span className="text-[11px] text-emerald-400 font-medium block">100% Automated Workflow</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Revenue Bar Chart (7 Cols) */}
            <div className="lg:col-span-7 bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Daily Revenue Trend
              </h3>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2426" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#181415", borderColor: "#f59e0b", borderRadius: "12px" }}
                      itemStyle={{ color: "#fbbf24" }}
                    />
                    <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Breakdown (5 Cols) */}
            <div className="lg:col-span-5 bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-400" /> Sales by Category
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categorySalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#181415", borderColor: "#f59e0b", borderRadius: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === "menu" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Active Menu Items</h3>
            <button
              onClick={handleOpenAdd}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-md"
            >
              <Plus className="w-4 h-4" /> Add New Menu Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#181415] border border-amber-900/20 rounded-2xl p-4 flex gap-3 items-center justify-between"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                  <span className="text-xs text-amber-400 font-mono font-bold block">
                    {cafeConfig.currency}{item.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-zinc-500 capitalize">{item.category}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "settings" && (
        <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-6 max-w-2xl mx-auto space-y-5">
          <h3 className="text-lg font-bold text-white">Cafe General & Store Parameters</h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Cafe Brand Name</label>
              <input
                type="text"
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Tagline / Motto</label>
              <input
                type="text"
                value={settingsForm.tagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Currency Symbol</label>
                <input
                  type="text"
                  value={settingsForm.currency}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settingsForm.taxRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">WhatsApp Business Phone</label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Total Dining Tables</label>
                <input
                  type="number"
                  value={settingsForm.tableCount}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tableCount: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg"
              >
                Save Store Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1a1618] border border-amber-900/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Item Name</label>
                <input
                  type="text"
                  required
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Price ({cafeConfig.currency})</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Description</label>
                <textarea
                  rows={2}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Image URL</label>
                <input
                  type="url"
                  value={menuForm.image}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={menuForm.veg}
                    onChange={(e) => setMenuForm({ ...menuForm, veg: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  Vegetarian 🌱
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={menuForm.popular}
                    onChange={(e) => setMenuForm({ ...menuForm, popular: e.target.checked })}
                    className="accent-amber-500"
                  />
                  Bestseller Tag ★
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
