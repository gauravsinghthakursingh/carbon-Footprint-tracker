import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoggedAction } from "../types";
import { Sprout, Database, Shield, Award, HelpCircle, Trees, Info } from "lucide-react";

interface VirtualForestProps {
  loggedActions: LoggedAction[];
}

export default function VirtualForest({ loggedActions }: VirtualForestProps) {
  const totalKgSaved = loggedActions.reduce((sum, action) => sum + action.kgSaved, 0);
  
  // Define items to render in the virtual garden
  // We plant 1 seedling for every 2 kg of CO2 saved, or at least 1 shrub per action
  const itemsToPlant = loggedActions.map((action, idx) => {
    // Determine plant type/design based on category and kgSaved
    let type: "seedling" | "flower" | "oak" | "fern" = "seedling";
    let color = "text-emerald-600";
    let size = "w-8 h-8";

    if (action.category === "Transport") {
      type = "oak";
      color = "text-[#5A5A40]";
      size = "w-10 h-10";
    } else if (action.category === "Diet") {
      type = "flower";
      color = "text-amber-600";
      size = "w-7 h-7";
    } else if (action.category === "Home") {
      type = "fern";
      color = "text-teal-600";
      size = "w-9 h-9";
    } else {
      type = "seedling";
      color = "text-emerald-500";
      size = "w-8 h-8";
    }

    return {
      id: action.id,
      title: action.title,
      kgSaved: action.kgSaved,
      category: action.category,
      type,
      color,
      size,
      delay: (idx % 6) * 0.1,
    };
  });

  // Calculate achievements
  const achievements = [
    {
      id: "first_swap",
      title: "First Step Swapper",
      desc: "Log your first carbon reducing action",
      unlocked: loggedActions.length > 0,
      icon: Sprout,
    },
    {
      id: "ten_kg",
      title: "Carbon Crusader",
      desc: "Offset more than 10.0 kg of CO2e",
      unlocked: totalKgSaved >= 10,
      icon: Award,
    },
    {
      id: "transport_warrior",
      title: "Green Commuter",
      desc: "Log at least one transport offset",
      unlocked: loggedActions.some((a) => a.category === "Transport"),
      icon: Trees,
    },
    {
      id: "diet_pioneer",
      title: "Planet Friendly Plate",
      desc: "Log a diet reduction action",
      unlocked: loggedActions.some((a) => a.category === "Diet"),
      icon: Shield,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-xs flex flex-col justify-between" id="virtual-forest-sanctuary">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif-vintage italic text-xl text-[#5A5A40] font-bold flex items-center gap-2">
            <Trees className="w-5 h-5 text-[#5A5A40]" />
            Terra Virtual Sanctuary
          </h3>
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C8C70]">Visual Impact Garden</span>
        </div>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Watch your logged habits turn into a thriving virtual garden. Every checklist action you execute breathes life into new trees and plants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Garden view plot */}
        <div className="lg:col-span-8 bg-[#FAF9F5] border border-[#E6E6DF] rounded-2xl p-6 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#5A5A40_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C70]">Interactive Micro-Plot</span>
              <span className="text-xs font-mono font-bold text-[#5A5A40] bg-white border border-[#E6E6DF] px-2 py-0.5 rounded-md">
                {itemsToPlant.length} Planted Seedlings
              </span>
            </div>

            {itemsToPlant.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-48">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <Sprout className="w-12 h-12 text-[#8C8C70]/40 mb-3" />
                </motion.div>
                <p className="text-xs font-serif italic text-[#8C8C70]">Your garden is currently a blank slate.</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[285px]">Log ecological checklist actions to sprout gorgeous custom foliage here instantly!</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 overflow-y-auto max-h-[190px] p-3 items-end justify-start min-h-[120px] bg-white border border-dashed border-[#D8D8C0]/85 rounded-xl">
                <AnimatePresence>
                  {itemsToPlant.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0, y: 15, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 12, delay: item.delay }}
                      className={`relative group cursor-pointer p-1 rounded-xl hover:bg-[#F5F5F0] transition-colors`}
                    >
                      {/* Detailed tooltip on plot tree */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-[#3A3A2F] text-[#F5F5F0] text-[10px] p-2.5 rounded-xl shadow-lg z-30 pointer-events-none">
                        <div className="font-bold border-b border-white/10 pb-1 mb-1 truncate">{item.title}</div>
                        <div className="flex justify-between font-mono text-[9px] opacity-80">
                          <span>{item.category}</span>
                          <span className="font-bold">-{item.kgSaved.toFixed(1)} kg CO₂e</span>
                        </div>
                      </div>

                      {/* Plant Visual */}
                      <div className="flex flex-col items-center justify-end">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: [0, -3, 3, 0] }}
                          className={`${item.color}`}
                        >
                          {item.type === "oak" && (
                            <svg className={item.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 9a4 4 0 0 0-4-4v4c2 0 4 0 4 0zM12 11a5 5 0 0 1 5-5v5s-3 0-5 0zM12 14a3 3 0 0 0-3-3v3h3z" />
                            </svg>
                          )}
                          {item.type === "flower" && (
                            <svg className={item.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M12 2v4M12 18v4M4 12h4M16 12h4" />
                            </svg>
                          )}
                          {item.type === "fern" && (
                            <svg className={item.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18a6 6 0 0 1 6-6 6 6 0 0 1 6 6M9 13a3 3 0 0 1 3-3 3 3 0 0 1 3 3" />
                            </svg>
                          )}
                          {item.type === "seedling" && (
                            <svg className={item.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M12 5l-4 4M12 5l4 4M12 12c-2 0-3-1-3-3s1-2 3-2" />
                            </svg>
                          )}
                        </motion.div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 mt-0.5 mt-1">-{item.kgSaved.toFixed(0)}k</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E6E6DF]/60 bg-white/50 p-2.5 rounded-xl flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
            <p className="text-[10px] text-[#3A3A2F]/85 leading-relaxed font-sans">
              To plant more seedlings and enrich your interactive micro-plot, switch over to the <strong>Sustain Checklist</strong> tab and log carbon habits!
            </p>
          </div>
        </div>

        {/* Achievements list */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-wider text-[#8C8C70]">
              <span>ECO BADGES UNLOCKED</span>
              <span className="font-mono text-xs text-[#5A5A40]">{unlockedCount} / {achievements.length}</span>
            </div>

            <div className="space-y-2">
              {achievements.map((ach) => {
                const IconComp = ach.icon;
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      ach.unlocked
                        ? "bg-[#FAF9F5] border-[#D8D8C0] text-[#3A3A2F]"
                        : "bg-slate-50/50 border-slate-100 text-slate-400 opacity-60"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      ach.unlocked ? "bg-[#5A5A40] text-white" : "bg-slate-200 text-slate-400"
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-normal">{ach.title}</p>
                      <p className="text-[9px] text-[#8C8C70] mt-0.5 leading-snug">{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-[#5A5A40] text-white p-3.5 rounded-2xl text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#D8D8C0]">TOTAL FOREST SAVED</p>
            <p className="text-xl font-serif-vintage italic font-bold">
              {(totalKgSaved / 20).toFixed(3)} tree-years
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
