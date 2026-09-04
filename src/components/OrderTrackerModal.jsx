import React from "react";
import { X, Clock, CheckCircle2, ChefHat, BellRing, Utensils, MessageSquareShare } from "lucide-react";
import { useCafe } from "../context/CafeContext";
import { createWhatsappShareLink } from "../services/whatsappBotService";

export default function OrderTrackerModal({ orderId, onClose }) {
  const { orders, cafeConfig } = useCafe();

  const order = orders.find((o) => o.id === orderId);

  if (!order) return null;

  const steps = [
    { key: "New", label: "Order Received", desc: "Sent to kitchen queue", icon: Clock },
    { key: "Preparing", label: "In Preparation", desc: "Barista & Chef crafting", icon: ChefHat },
    { key: "Ready", label: "Ready to Serve!", desc: "Pick up or table delivery", icon: BellRing },
    { key: "Delivered", label: "Completed", desc: "Enjoy your meal!", icon: Utensils }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case "New": return 0;
      case "Preparing": return 1;
      case "Ready": return 2;
      case "Delivered": return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  // WhatsApp quick query
  const whatsappQueryMessage = `Hi ${cafeConfig.name}! I am checking on my Order #${order.id} for Table ${order.tableNumber || 'Takeaway'}. Current Status: ${order.status}`;
  const whatsappLink = createWhatsappShareLink(cafeConfig.whatsappNumber, whatsappQueryMessage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1a1618] border border-amber-900/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-900/40 via-zinc-900 to-zinc-900 border-b border-amber-900/20 flex items-center justify-between">
          <div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Live Tracker • #{order.id}
            </span>
            <h3 className="text-lg font-bold text-white mt-1">Order Progress</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Timeline */}
        <div className="p-6 space-y-6">
          <div className="relative pl-6 border-l-2 border-zinc-800 space-y-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="relative">
                  {/* Step Dot Icon */}
                  <div
                    className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse"
                        : isDone
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  {/* Step Content */}
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent
                          ? "text-amber-400"
                          : isDone
                          ? "text-white"
                          : "text-zinc-500"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Cards */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
              <span>Table / Type: <strong className="text-white">{order.tableNumber ? `Table ${order.tableNumber}` : order.orderType}</strong></span>
              <span>Source: <strong className="text-amber-400">{order.source}</strong></span>
            </div>
            
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-zinc-300">
                  <span>{item.quantity}x {item.name} {item.customization && <span className="text-zinc-500">({item.customization})</span>}</span>
                  <span className="font-mono text-zinc-400">{cafeConfig.currency}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Bill</span>
              <span className="text-amber-400 font-mono text-base">{cafeConfig.currency}{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* WhatsApp Direct Inquiry Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-lg shadow-emerald-600/20"
          >
            <MessageSquareShare className="w-4 h-4" />
            Ask Barista on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
