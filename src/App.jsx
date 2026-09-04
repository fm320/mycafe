import React, { useState } from "react";
import { CafeProvider } from "./context/CafeContext";
import Navbar from "./components/Navbar";
import CustomerMenu from "./components/CustomerMenu";
import PosBilling from "./components/PosBilling";
import KitchenDisplay from "./components/KitchenDisplay";
import WhatsappAutomation from "./components/WhatsappAutomation";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState("customer");

  return (
    <CafeProvider>
      <div className="min-h-screen bg-[#0f0d0e] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1">
          {activeTab === "customer" && <CustomerMenu />}
          {activeTab === "pos" && <PosBilling />}
          {activeTab === "kitchen" && <KitchenDisplay />}
          {activeTab === "whatsapp" && <WhatsappAutomation />}
          {activeTab === "admin" && <AdminDashboard />}
        </main>
      </div>
    </CafeProvider>
  );
}
