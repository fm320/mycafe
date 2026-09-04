import React, { useState } from "react";
import { X, Plus, Minus, Check, Sparkles } from "lucide-react";
import { useCafe } from "../context/CafeContext";

export default function CustomizationModal({ item, onClose, onAddToCart }) {
  const { cafeConfig } = useCafe();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initial = {};
    if (item.options) {
      Object.keys(item.options).forEach((key) => {
        if (item.options[key] && item.options[key].length > 0) {
          initial[key] = item.options[key][0];
        }
      });
    }
    return initial;
  });

  const [notes, setNotes] = useState("");

  const handleOptionChange = (group, option) => {
    setSelectedOptions((prev) => ({ ...prev, [group]: option }));
  };

  // Calculate extra cost if options specify price add-on (e.g. Oat Milk +₹30 or +$0.75)
  const calculateExtraCost = () => {
    let extra = 0;
    Object.values(selectedOptions).forEach((optVal) => {
      const match = optVal.match(/\+[₹$]?\s*(\d+(\.\d+)?)/);
      if (match) {
        extra += parseFloat(match[1]);
      }
    });
    return extra;
  };

  const itemUnitPrice = item.price + calculateExtraCost();
  const totalPrice = itemUnitPrice * quantity;

  const handleConfirm = () => {
    const customizationString = Object.values(selectedOptions).join(", ") + (notes ? ` (${notes})` : "");
    onAddToCart({
      ...item,
      price: itemUnitPrice,
      quantity,
      customization: customizationString,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1a1618] border border-amber-900/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header with Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1618] via-transparent to-black/40"></div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-amber-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              {item.category}
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{item.name}</h3>
          </div>
        </div>

        {/* Content & Options */}
        <div className="p-5 space-y-5 flex-1">
          <p className="text-sm text-zinc-400">{item.description}</p>

          {/* Dynamic Option Groups */}
          {item.options && Object.keys(item.options).length > 0 && (
            <div className="space-y-4 pt-2">
              {Object.entries(item.options).map(([groupKey, optionsList]) => (
                <div key={groupKey} className="space-y-2">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    {groupKey}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {optionsList.map((opt) => {
                      const isSelected = selectedOptions[groupKey] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleOptionChange(groupKey, opt)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/10"
                              : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-zinc-400 block">
              Special Instructions / Allergy Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Extra hot, no whipped cream..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add Button */}
        <div className="p-4 bg-[#141012] border-t border-zinc-800/80 rounded-b-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-bold text-white w-5 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center hover:bg-amber-400 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-lg shadow-amber-600/20 hover:from-amber-500 hover:to-amber-400 transition flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Add to Order • {cafeConfig.currency}{totalPrice.toFixed(2)}
          </button>
        </div>

      </div>
    </div>
  );
}
