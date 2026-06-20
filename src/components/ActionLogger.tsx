import React, { useState } from "react";
import { Search, Plus, Trash2, CheckCircle2, ChevronRight, Leaf, Eye, EyeOff } from "lucide-react";
import { LoggedAction, ActionPreset } from "../types";
import { ECO_ACTION_PRESETS } from "../presets";

interface ActionLoggerProps {
  loggedActions: LoggedAction[];
  onAddAction: (action: Omit<LoggedAction, "id" | "timestamp">) => void;
  onRemoveAction: (id: string) => void;
}

export default function ActionLogger({ loggedActions, onAddAction, onRemoveAction }: ActionLoggerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Transport" | "Diet" | "Home" | "Waste">("All");
  
  // Custom Action State
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customKg, setCustomKg] = useState("1.5");
  const [customCategory, setCustomCategory] = useState<"Transport" | "Diet" | "Home" | "Waste">("Transport");

  // Filtering presets
  const filteredPresets = ECO_ACTION_PRESETS.filter((preset) => {
    const matchesCategory = selectedCategory === "All" || preset.category === selectedCategory;
    const matchesSearch = preset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          preset.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onAddAction({
      title: customTitle.trim(),
      category: customCategory,
      kgSaved: parseFloat(customKg) || 1.0,
      isCustom: true
    });

    setCustomTitle("");
    setCustomKg("1.5");
    setShowCustomForm(false);
  };

  return (
    <div className="bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col h-full" id="carbon-action-logger">
      
      {/* Title & Stats */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E6E6DF]">
        <div>
          <h2 className="text-xl font-serif italic font-bold tracking-tight text-[#5A5A40] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#5A5A40]" />
            2. Ecological Actions
          </h2>
          <p className="text-xs text-[#8C8C70] mt-1">Actively record mitigation habits to offset emissions</p>
        </div>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="px-3.5 py-1.5 bg-[#FAF9F5] border border-[#E6E6DF] text-xs font-bold text-[#5A5A40] hover:bg-[#F5F5F0] rounded-xl flex items-center gap-1.5 transition-all"
        >
          {showCustomForm ? "Close Form" : "Custom Action"}
        </button>
      </div>

      {/* CUSTOM ADHOC FORM */}
      {showCustomForm && (
        <form onSubmit={handleCustomSubmit} className="mb-6 p-4 bg-[#F5F5F0] border border-[#E6E6DF] rounded-2xl space-y-4 animate-fadeIn">
          <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">Log Custom Sustainability Action</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C8C70] block mb-1">Action Name</label>
              <input
                type="text"
                placeholder="e.g. Planted wildflower planter"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E6E6DF] rounded-xl focus:border-[#5A5A40] outline-hidden placeholder-[#8C8C70]/65 text-[#3A3A2F]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C8C70] block mb-1">Carbon Reduction (kg CO₂e)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50.0"
                value={customKg}
                onChange={(e) => setCustomKg(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E6E6DF] rounded-xl focus:border-[#5A5A40] outline-hidden text-[#3A3A2F]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 gap-4">
            <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-[#E6E6DF]">
              {(["Transport", "Diet", "Home", "Waste"] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCustomCategory(cat)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg capitalize transition-all ${
                    customCategory === cat
                      ? "bg-[#5A5A40] text-white"
                      : "text-[#8C8C70] hover:text-[#5A5A40]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#5A5A40] hover:bg-[#4A4A33] text-white text-xs font-bold rounded-xl transition-all"
            >
              Add to Diary
            </button>
          </div>
        </form>
      )}

      {/* FILTER SEARCH UTILITY BAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8C70] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search verified eco habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#F5F5F0] border border-[#E6E6DF] rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-hidden text-[#3A3A2F]"
          />
        </div>
        <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-thin">
          {(["All", "Transport", "Diet", "Home", "Waste"] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 text-[11px] font-bold rounded-xl border whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                  : "bg-white text-[#8C8C70] border-[#E6E6DF] hover:border-[#8C8C70]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* LIST OF AVAILABLE HABITS PRESETS */}
      <div className="flex-1 overflow-y-auto max-h-[220px] mb-6 space-y-2 border border-[#E6E6DF]/60 p-2 bg-[#FAF9F5] rounded-2xl scrollbar-card">
        {filteredPresets.length === 0 ? (
          <div className="py-8 text-center text-[#8C8C70] text-xs font-serif italic">
            No habits matched your search criterion
          </div>
        ) : (
          filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3.5 bg-white border border-[#E6E6DF] rounded-xl hover:border-[#8C8C70] hover:shadow-xs transition-all duration-150 group"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    preset.category === "Transport" ? "bg-amber-400" :
                    preset.category === "Diet" ? "bg-[#5A5A40]" :
                    preset.category === "Home" ? "bg-sky-400" : "bg-[#D8D8C0]"
                  }`} />
                  <p className="text-xs font-bold text-[#3A3A2F] truncate">{preset.title}</p>
                </div>
                <p className="text-[10px] text-[#8C8C70] mt-0.5 leading-normal truncate">{preset.description}</p>
              </div>
              
              <button
                onClick={() => onAddAction({
                  title: preset.title,
                  category: preset.category,
                  kgSaved: preset.kgSaved
                })}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white rounded-lg text-[10px] font-bold text-[#5A5A40] transition-colors font-mono"
              >
                +{preset.kgSaved} kg Saved
              </button>
            </div>
          ))
        )}
      </div>

      {/* ACTIVE LOGGED JOURNAL ITEMS (Natural Tones Checked Style) */}
      <div className="border-t border-[#E6E6DF] pt-5">
        <h3 className="font-serif italic font-semibold text-[#5A5A40] text-sm mb-3.5 flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-[#5A5A40]" />
          Today's Reduction Log
        </h3>
        {loggedActions.length === 0 ? (
          <div className="py-6 px-4 bg-[#F5F5F0] rounded-2xl border border-dashed border-[#E6E6DF] text-center text-[#8C8C70] text-xs font-serif italic">
            No carbon actions logged today. Log verified habits above to begin your journal.
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {loggedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 bg-[#F5F5F0] rounded-xl border border-[#E6E6DF] group hover:border-[#8C8C70] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5A5A40] flex items-center justify-center text-white">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#3A3A2F]">{action.title}</p>
                    <p className="text-[9px] text-[#8C8C70] tracking-wide uppercase font-semibold">{action.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif italic font-bold text-[#5A5A40] bg-white border border-[#E6E6DF] px-2 py-0.5 rounded-lg">
                    -{action.kgSaved.toFixed(1)} kg
                  </span>
                  <button
                    onClick={() => onRemoveAction(action.id)}
                    className="p-1 text-[#8C8C70] hover:text-red-500 hover:bg-white rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="Remove action log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
