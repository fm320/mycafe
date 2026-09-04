import React from "react";
import { Users, Clock, Coffee, Sparkles } from "lucide-react";
import { useCafe } from "../context/CafeContext";

export default function TableMap({ selectedTableNum, onSelectTable }) {
  const { tables, orders, setTableStatus } = useCafe();

  const getStatusBadge = (status) => {
    switch (status) {
      case "occupied":
        return { label: "Occupied", bg: "bg-rose-500/20 text-rose-300 border-rose-500/30", dot: "bg-rose-500" };
      case "reserved":
        return { label: "Reserved", bg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", dot: "bg-indigo-400" };
      default:
        return { label: "Available", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" };
    }
  };

  const getElapsedMinutes = (seatedTime) => {
    if (!seatedTime) return null;
    const diffMs = Date.now() - new Date(seatedTime).getTime();
    return Math.floor(diffMs / 60000);
  };

  return (
    <div className="bg-[#181415] border border-amber-900/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" /> Interactive Floor & Table Map
          </h3>
          <p className="text-xs text-zinc-400">Click a table to inspect live orders or change status</p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Available
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Occupied
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Reserved
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {tables.map((table) => {
          const badge = getStatusBadge(table.status);
          const isSelected = selectedTableNum === table.number;
          const elapsedMins = getElapsedMinutes(table.seatedTime);

          return (
            <div
              key={table.id}
              onClick={() => onSelectTable(table.number)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 relative group ${
                isSelected
                  ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-lg">#{table.number}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              <div className="space-y-1 text-xs text-zinc-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-zinc-500" />
                  <span>{table.capacity} Seats</span>
                </div>

                {elapsedMins !== null && (
                  <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{elapsedMins}m dining</span>
                  </div>
                )}
              </div>

              {/* Status Action Buttons on Hover */}
              <div className="flex items-center gap-1 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTableStatus(table.number, table.status === "occupied" ? "available" : "occupied");
                  }}
                  className="w-full text-[10px] font-bold py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  {table.status === "occupied" ? "Vacate" : "Occupy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
