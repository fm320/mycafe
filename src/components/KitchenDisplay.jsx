import React from "react";
import { Clock, ChefHat, Bell, CheckCircle, Volume2, MessageSquare, AlertCircle, Coffee } from "lucide-react";
import { useCafe } from "../context/CafeContext";
import { createWhatsappShareLink } from "../services/whatsappBotService";

export default function KitchenDisplay() {
  const { orders, updateOrderStatus, cafeConfig, playKitchenChime } = useCafe();

  // Active tickets queue (Exclude Delivered and Cancelled)
  const activeOrders = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");

  const getStatusColor = (status) => {
    switch (status) {
      case "New": return "bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30";
      case "Preparing": return "bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30";
      case "Ready": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30";
      default: return "bg-zinc-800 text-zinc-400";
    }
  };

  const getElapsedMins = (createdAt) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  const getTimerBadge = (mins) => {
    if (mins >= 20) return "bg-rose-600 text-white font-bold animate-pulse";
    if (mins >= 10) return "bg-amber-500 text-slate-950 font-bold";
    return "bg-emerald-600 text-white font-semibold";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      
      {/* Top Header & Audio Test */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#181415] border border-amber-900/20 rounded-2xl p-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-400" /> Kitchen Display System (KDS)
          </h2>
          <p className="text-xs text-zinc-400">Real-time order tickets for Baristas & Kitchen Staff</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={playKitchenChime}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-amber-400 hover:text-amber-300 hover:border-amber-500/40 transition flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" /> Test Sound Alert
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
            {activeOrders.length} Active Tickets
          </div>
        </div>
      </div>

      {/* Tickets Queue Grid */}
      {activeOrders.length === 0 ? (
        <div className="text-center py-20 bg-[#181415] border border-zinc-800/80 rounded-2xl p-8 space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">All Kitchen Tickets Cleared!</h3>
          <p className="text-xs text-zinc-400">No active orders pending in preparation queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeOrders.map((order) => {
            const elapsed = getElapsedMins(order.createdAt);
            const statusClass = getStatusColor(order.status);
            const timerClass = getTimerBadge(elapsed);

            // WhatsApp update message link
            const whatsappText = `Hi ${order.customerName}! Your order #${order.id} for Table ${order.tableNumber || 'Takeaway'} is now *${order.status.toUpperCase()}*! ☕`;
            const whatsappLink = createWhatsappShareLink(order.customerPhone || cafeConfig.whatsappNumber, whatsappText);

            return (
              <div
                key={order.id}
                className="bg-[#181415] border border-amber-900/30 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between flex-1 hover:border-amber-500/40 transition"
              >
                {/* Ticket Top Bar */}
                <div className="p-3.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-white">#{order.id}</span>
                    <span className="text-xs font-bold text-amber-400 ml-2">
                      {order.tableNumber ? `Table #${order.tableNumber}` : order.orderType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${timerClass}`}>
                      {elapsed}m ago
                    </span>
                  </div>
                </div>

                {/* Meta Customer & Source info */}
                <div className="px-4 py-2 bg-zinc-950/40 text-[11px] text-zinc-400 border-b border-zinc-800/50 flex justify-between">
                  <span>Guest: <strong className="text-zinc-200">{order.customerName}</strong></span>
                  <span>Via: <strong className="text-amber-400">{order.source}</strong></span>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-white text-xs">
                            <span className="text-amber-400 text-sm font-black mr-1.5">{item.quantity}x</span>
                            {item.name}
                          </span>
                        </div>
                        {item.customization && (
                          <p className="text-[11px] text-amber-300/90 font-medium pl-4 border-l-2 border-amber-500/40">
                            {item.customization}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Status Progression Footer */}
                <div className="p-3 bg-[#141012] border-t border-zinc-800 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => updateOrderStatus(order.id, "New")}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                        order.status === "New"
                          ? "bg-rose-500 text-white"
                          : "bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "Preparing")}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                        order.status === "Preparing"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Preparing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "Ready")}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                        order.status === "Ready"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Ready
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => updateOrderStatus(order.id, "Delivered")}
                      className="w-full bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white font-bold py-1.5 rounded-lg text-xs transition"
                    >
                      ✓ Mark Served / Delivered
                    </button>

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Send WhatsApp Update to Customer"
                      className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition border border-emerald-500/30"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
