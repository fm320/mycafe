import React from "react";
import { X, Printer, MessageSquare, CheckCircle, Coffee, ShieldCheck } from "lucide-react";
import { useCafe } from "../context/CafeContext";
import { createWhatsappShareLink, formatReceiptForWhatsapp } from "../services/whatsappBotService";

export default function ReceiptModal({ order, onClose }) {
  const { cafeConfig } = useCafe();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const whatsappReceiptText = formatReceiptForWhatsapp(order, cafeConfig);
  const whatsappLink = createWhatsappShareLink(order.customerPhone || cafeConfig.whatsappNumber, whatsappReceiptText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1c181a] border border-amber-900/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Invoice Receipt #{order.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-amber-50 text-slate-900 font-mono text-xs space-y-4 printable-area">
          {/* Cafe Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
            <h2 className="text-base font-extrabold font-sans uppercase tracking-wider text-amber-900">
              {cafeConfig.name}
            </h2>
            <p className="text-[11px] text-slate-600">{cafeConfig.address}</p>
            <p className="text-[11px] text-slate-600">Ph: {cafeConfig.phone} | Tax ID: 882-AR-2026</p>
          </div>

          {/* Meta details */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-bold">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Table / Type:</span>
              <span className="font-bold">{order.tableNumber ? `Table ${order.tableNumber}` : order.orderType}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 py-1">
            <div className="flex justify-between font-bold border-b border-slate-300 pb-1">
              <span>ITEM</span>
              <span>QTY x PRICE</span>
              <span>TOTAL</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-medium">
                  <span className="max-w-[160px] truncate">{item.name}</span>
                  <span>{item.quantity} x {cafeConfig.currency}{item.price.toFixed(2)}</span>
                  <span className="font-bold">{cafeConfig.currency}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.customization && (
                  <p className="text-[10px] text-slate-500 italic pl-2">» {item.customization}</p>
                )}
              </div>
            ))}
          </div>

          {/* Totals & Tax */}
          <div className="pt-2 border-t border-dashed border-slate-400 space-y-1 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{cafeConfig.currency}{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax ({cafeConfig.taxRate}%):</span>
              <span>{cafeConfig.currency}{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-1 border-t border-slate-400">
              <span>GRAND TOTAL:</span>
              <span>{cafeConfig.currency}{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Status & Footer */}
          <div className="text-center pt-3 border-t border-dashed border-slate-400 space-y-1">
            <p className="font-bold text-emerald-700 uppercase tracking-widest text-[11px]">
              ★ PAYMENT STATUS: {order.paymentStatus} ({order.paymentMethod}) ★
            </p>
            <p className="text-[10px] text-slate-500">Thank you for dining with us! Have a wonderful day! ☕</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" /> Print Thermal Bill
          </button>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
          >
            <MessageSquare className="w-4 h-4" /> Send Bill via WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
