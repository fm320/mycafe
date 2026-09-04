import React from "react";
import { Coffee, ShoppingBag, Utensils, MessageSquare, LayoutDashboard, Radio } from "lucide-react";
import { useCafe } from "../context/CafeContext";

export default function Navbar({ activeTab, setActiveTab }) {
  const { cafeConfig, orders, tables } = useCafe();

  const activeOrdersCount = orders.filter(
    (o) => o.status === "New" || o.status === "Preparing"
  ).length;

  const occupiedTablesCount = tables.filter((t) => t.status === "occupied").length;

  const navItems = [
    { id: "customer", label: "Digital Menu", icon: Coffee },
    { id: "pos", label: "POS & Tables", icon: ShoppingBag, badge: occupiedTablesCount ? `${occupiedTablesCount} Busy` : null },
    { id: "kitchen", label: "Kitchen KDS", icon: Utensils, badge: activeOrdersCount > 0 ? activeOrdersCount : null, alert: activeOrdersCount > 0 },
    { id: "whatsapp", label: "WhatsApp Hub", icon: MessageSquare, badge: "Bot Active" },
    { id: "admin", label: "Admin & Analytics", icon: LayoutDashboard }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#161214]/90 backdrop-blur-md border-b border-amber-900/20 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Cafe Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("customer")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide leading-tight flex items-center gap-2">
                {cafeConfig.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-amber-400/80 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                WhatsApp Automation Live
              </div>
            </div>
          </div>

          {/* Mobile Badge indicator */}
          <div className="md:hidden flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {cafeConfig.currency} Live
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold ${
                      isActive
                        ? "bg-slate-950 text-amber-400"
                        : item.alert
                        ? "bg-rose-500 text-white animate-bounce"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
