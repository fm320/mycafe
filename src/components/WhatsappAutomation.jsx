import React, { useState } from "react";
import { MessageSquare, Send, Bot, Sparkles, RefreshCw, Settings, ShieldCheck, ExternalLink, Copy, Check, Smartphone, Radio } from "lucide-react";
import { useCafe } from "../context/CafeContext";

export default function WhatsappAutomation() {
  const { cafeConfig, updateCafeConfig, whatsappMessages, sendWhatsappMessage, clearWhatsappChat } = useCafe();

  const [inputMessage, setInputMessage] = useState("");
  const [activeTab, setActiveTab] = useState("simulator"); // 'simulator' or 'settings'
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Settings form local state
  const [botConfig, setBotConfig] = useState(cafeConfig.whatsappBot);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendWhatsappMessage(inputMessage);
    setInputMessage("");
  };

  const handleQuickChip = (text) => {
    sendWhatsappMessage(text);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateCafeConfig({ whatsappBot: botConfig });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(botConfig.webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      
      {/* Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#181415] border border-amber-900/20 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              WhatsApp Chat Automation Engine
            </h2>
            <p className="text-xs text-zinc-400">Conversational AI Barista & Automated Ordering Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "simulator"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" /> Live Bot Simulator
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" /> API & Bot Settings
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === "simulator" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Smartphone Mockup Frame (7 Cols) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md bg-slate-950 border-4 border-zinc-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
              
              {/* Smartphone Header Bar */}
              <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-800 border border-emerald-400 flex items-center justify-center font-bold text-sm">
                    ☕
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                      {botConfig.botName}
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h3>
                    <p className="text-[10px] text-emerald-100/80">Automated Cafe Assistant • Online</p>
                  </div>
                </div>

                <button
                  onClick={clearWhatsappChat}
                  title="Reset Chat History"
                  className="p-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-white transition text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Whatsapp Background Chat Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                {whatsappMessages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 shadow-md whitespace-pre-wrap ${
                          isUser
                            ? "bg-[#005c4b] text-white rounded-tr-none"
                            : "bg-[#202c33] text-zinc-100 rounded-tl-none border border-zinc-700/50"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <span className="text-[9px] text-zinc-400 block text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Action Chips */}
              <div className="px-3 py-2 bg-[#111b21] border-t border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => handleQuickChip("MENU")}
                  className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold whitespace-nowrap transition"
                >
                  📋 View Menu
                </button>
                <button
                  onClick={() => handleQuickChip("Order 2 Cappuccino for Table 3")}
                  className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold whitespace-nowrap transition"
                >
                  ☕ Order Cappuccino
                </button>
                <button
                  onClick={() => handleQuickChip("STATUS")}
                  className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold whitespace-nowrap transition"
                >
                  🔎 Check Status
                </button>
                <button
                  onClick={() => handleQuickChip("RESERVE")}
                  className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold whitespace-nowrap transition"
                >
                  🪑 Book Table
                </button>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#202c33] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message (e.g. 'Order 1 Latte for Table 2')..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#2a3942] rounded-xl text-xs text-white placeholder-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-[#00a884] hover:bg-[#008f70] text-slate-950 font-bold flex items-center justify-center transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>

          {/* Right: How It Works & Bot Capabilities (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Automated Bot Commands
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The built-in WhatsApp AI Bot handles customer orders 24/7. When customers send text messages, the bot automatically parses order items and injects tickets into your live KDS and POS!
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-emerald-400">1. Digital Menu Delivery</span>
                  <p className="text-xs text-zinc-300">
                    Sending <code className="text-amber-300">MENU</code> replies with current prices, descriptions, and ordering syntax.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-emerald-400">2. Natural Language Ordering</span>
                  <p className="text-xs text-zinc-300">
                    Sending <code className="text-amber-300">Order 2 Smokey Velvet Latte for Table 2</code> automatically creates order <strong className="text-white">#ord-104</strong> in the system.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-emerald-400">3. Live Status Tracker</span>
                  <p className="text-xs text-zinc-300">
                    Sending <code className="text-amber-300">STATUS</code> returns real-time kitchen status (<em className="text-amber-400">Preparing / Ready</em>).
                  </p>
                </div>
              </div>

              {/* Direct wa.me Link Demo */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-white block">Direct Customer WhatsApp Link</span>
                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 truncate">https://wa.me/{cafeConfig.whatsappNumber}</span>
                  <a
                    href={`https://wa.me/${cafeConfig.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold ml-2"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* Settings Tab View */
        <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-6 max-w-3xl mx-auto space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">WhatsApp Cloud API & Webhook Configuration</h3>
            <p className="text-xs text-zinc-400">Configure Meta WhatsApp Business API credentials or Twilio webhook endpoints</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div>
                <span className="text-sm font-bold text-white block">Enable WhatsApp Bot Engine</span>
                <span className="text-xs text-zinc-400">Automatically respond to customer incoming messages</span>
              </div>
              <input
                type="checkbox"
                checked={botConfig.enabled}
                onChange={(e) => setBotConfig({ ...botConfig, enabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Bot Assistant Display Name</label>
              <input
                type="text"
                value={botConfig.botName}
                onChange={(e) => setBotConfig({ ...botConfig, botName: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Automated Greeting Message</label>
              <textarea
                rows={4}
                value={botConfig.greeting}
                onChange={(e) => setBotConfig({ ...botConfig, greeting: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Meta Permanent Access Token</label>
                <input
                  type="password"
                  value={botConfig.metaApiKey}
                  onChange={(e) => setBotConfig({ ...botConfig, metaApiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Phone Number ID</label>
                <input
                  type="text"
                  value={botConfig.phoneNumberId}
                  onChange={(e) => setBotConfig({ ...botConfig, phoneNumberId: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-zinc-300 block">Webhook Payload Listener URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={botConfig.webhookUrl}
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-emerald-400 font-mono"
                />
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedWebhook ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
              >
                Save WhatsApp API Configuration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
