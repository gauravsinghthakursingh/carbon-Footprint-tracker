import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, Flame, Play, Eye, Calendar, Award, Compass, RefreshCw, Zap, Shield, CheckCircle } from "lucide-react";
import { CalculatorData, LoggedAction } from "../types";
import { motion } from "motion/react";

interface ClimateHubProps {
  calculatorData: CalculatorData;
  loggedActions: LoggedAction[];
}

interface Quest {
  id: string;
  title: string;
  criteria: string;
  unlocked: boolean;
  colorClass: string;
  icon: React.ReactNode;
}

export default function ClimateHub({ calculatorData, loggedActions }: ClimateHubProps) {
  // Real-time ticking global savings simulator to create amazing visual energy
  const [globalSavings, setGlobalSavings] = useState(1284560.25);
  const [sessionSavings, setSessionSavings] = useState(0.0);

  useEffect(() => {
    const interval = setInterval(() => {
      // average saved collectively at 1.4kg per second
      setGlobalSavings((prev) => prev + 0.0014);
      setSessionSavings((prev) => prev + 0.0003);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Compute active gamified climate achievements
  const quests: Quest[] = [
    {
      id: "ev_driver",
      title: "EV Adventurer",
      criteria: "Use Electric Commuting",
      unlocked: calculatorData.carType === "ev",
      colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
      icon: <Zap className="w-5 h-5 text-emerald-600" />
    },
    {
      id: "clean_power",
      title: "Grid Purist",
      criteria: "Enable Renewable energy",
      unlocked: calculatorData.cleanGrid === "yes",
      colorClass: "bg-sky-50 text-sky-800 border-sky-300/60",
      icon: <Shield className="w-5 h-5 text-sky-600" />
    },
    {
      id: "low_mileage",
      title: "Active Commuter",
      criteria: "Transit miles over car miles",
      unlocked: Number(calculatorData.transitMiles) > Number(calculatorData.carMiles),
      colorClass: "bg-amber-50 text-amber-800 border-amber-300/60",
      icon: <Compass className="w-5 h-5 text-amber-600" />
    },
    {
      id: "vegan_swaps",
      title: "Planted Soul",
      criteria: "Adopt plant-based style dietary preference",
      unlocked: calculatorData.dietType === "vegan" || calculatorData.dietType === "vegetarian",
      colorClass: "bg-teal-50 text-teal-800 border-teal-200/60",
      icon: <Sparkles className="w-5 h-5 text-teal-600" />
    },
    {
      id: "zero_waste",
      title: "Circular Eco",
      criteria: "Low waste & full composting",
      unlocked: calculatorData.wasteGeneration === "low" && calculatorData.compost === "yes",
      colorClass: "bg-violet-50 text-violet-800 border-violet-200/60",
      icon: <Award className="w-5 h-5 text-violet-600" />
    },
    {
      id: "offset_veteran",
      title: "Active Sustainer",
      criteria: "Log at least 3 ecological actions",
      unlocked: loggedActions.length >= 3,
      colorClass: "bg-rose-50 text-rose-800 border-rose-200/60",
      icon: <Trophy className="w-5 h-5 text-rose-600" />
    }
  ];

  const unlockedCount = quests.filter((q) => q.unlocked).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="climate-hub-module">
      
      {/* Live Global & Local Tapping Board */}
      <div className="md:col-span-5 bg-[#FAF9F5] border border-[#E6E6DF] rounded-[32px] p-6 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8C70] font-bold">
              Real-Time Climate Engine
            </span>
          </div>
          
          <h3 className="font-serif italic text-[#5A5A40] text-lg font-bold leading-tight">
            Terra Saving Velocity
          </h3>
          <p className="text-xs text-[#8C8C70] mt-1 pr-4">
            Simulated atmospheric carbon offset saving rate globally using our ecosystem.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8C70]">Global Shared Savings</div>
              <div className="text-2xl font-mono text-[#5A5A40] font-bold tracking-tight mt-1">
                {globalSavings.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                <span className="text-xs font-sans font-bold text-[#8C8C70] ml-1.5 align-middle">kg CO₂e</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E6E6DF]/50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8C70]">Your Live Session Benefit</div>
              <div className="text-lg font-mono text-[#5A5A40] font-bold tracking-tight mt-1">
                +{sessionSavings.toFixed(6)}
                <span className="text-[11px] font-sans text-[#8C8C70] ml-1 align-middle">kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3.5 border-t border-[#E6E6DF]/60 bg-white/60 p-3 rounded-2xl border border-[#E6E6DF]/40">
          <p className="text-[9.5px] italic text-[#8C8C70] leading-relaxed">
            Every second logged to Terra guides community optimization indices. Adjust left metrics dynamically to see achievements.
          </p>
        </div>
      </div>

      {/* Gamified Badges Grid */}
      <div className="md:col-span-7 bg-white border border-[#E6E6DF] rounded-[32px] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif italic text-lg text-[#5A5A40] font-bold">Ecological Achievements</h3>
              <p className="text-xs text-[#8C8C70] mt-0.5">Adjust parameter properties to unlock milestone badges</p>
            </div>
            <div className="bg-[#FAF9F5] border border-[#E6E6DF] px-3 py-1 rounded-xl text-center">
              <span className="text-[10px] font-mono font-bold text-[#5A5A40]">
                {unlockedCount} / {quests.length} UNLOCKED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quests.map((quest) => (
              <motion.div
                key={quest.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all duration-300 ${
                  quest.unlocked 
                    ? quest.colorClass + " bg-opacity-100 shadow-xs" 
                    : "bg-white border-[#E6E6DF] opacity-45 cursor-default filter grayscale"
                }`}
              >
                <div className="p-1.5 rounded-xl bg-white border border-[#E6E6DF]/60 flex-shrink-0">
                  {quest.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold text-[#3A3A2F] truncate leading-tight flex items-center gap-1">
                    {quest.title}
                    {quest.unlocked && <CheckCircle className="w-3 h-3 text-emerald-600 inline-block" />}
                  </p>
                  <p className="text-[9px] text-[#8C8C70]/90 truncate leading-snug mt-0.5" title={quest.criteria}>
                    {quest.criteria}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E6E6DF]/60">
          <div className="relative h-1.5 bg-[#FAF9F5] border border-[#E6E6DF]/60 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-[#5A5A40] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / quests.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
