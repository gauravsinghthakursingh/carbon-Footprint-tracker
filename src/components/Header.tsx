import React from "react";
import { Trees, Sparkles, Flame, Sprout, Award, HelpCircle } from "lucide-react";
import { LoggedAction } from "../types";

interface HeaderProps {
  loggedActions: LoggedAction[];
}

export default function Header({ loggedActions }: HeaderProps) {
  const totalKgSaved = loggedActions.reduce((sum, action) => sum + action.kgSaved, 0);
  
  // 1 tree absorbs approx 20kg of CO2 per year.
  const treesEquivalent = totalKgSaved / 20;

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white border border-[#E6E6DF] rounded-[32px] p-6 shadow-sm relative overflow-hidden" id="dashboard-header">
      {/* Dynamic Background Organic Accent */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 text-[#5A5A40] opacity-[0.03] select-none pointer-events-none">
        <Sprout className="w-80 h-80 animate-pulse" />
      </div>

      <div className="flex items-center space-x-3 relative z-10">
        <div className="w-12 h-12 bg-[#5A5A40] rounded-full flex items-center justify-center shadow-sm">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif italic font-bold tracking-tight text-[#5A5A40]">Terra</h1>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#F5F5F0] text-[#8C8C70] rounded-md border border-[#E6E6DF] font-semibold">
              Eco Engine
            </span>
          </div>
          <p className="text-xs text-[#8C8C70] font-sans mt-0.5">
            Understand, track & offset your carbon footprint with server-side Gemini AI.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 relative z-10 w-full md:w-auto" id="header-metrics">
        {/* Dynamic Metric: Combined Offset */}
        <div className="flex items-center space-x-3 bg-[#F5F5F0] border border-[#E6E6DF] px-4 py-2.5 rounded-2xl min-w-[130px]">
          <div className="w-8 h-8 rounded-full bg-[#D8D8C0] flex items-center justify-center text-[#5A5A40]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C70] leading-none">Offset Today</p>
            <p className="text-lg font-serif italic font-bold text-[#5A5A40] mt-0.5" id="co2-offset-header">
              {totalKgSaved.toFixed(1)} <span className="text-[10px] font-sans text-[#8C8C70]">kg</span>
            </p>
          </div>
        </div>

        {/* Dynamic Metric: Tree Absorption */}
        <div className="flex items-center space-x-3 bg-[#F5F5F0] border border-[#E6E6DF] px-4 py-2.5 rounded-2xl min-w-[130px]">
          <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
            <Trees className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C70] leading-none">Tree Absorbed</p>
            <p className="text-lg font-serif italic font-bold text-[#5A5A40] mt-0.5">
              {treesEquivalent.toFixed(2)} <span className="text-[10px] font-sans text-[#8C8C70]">/ yr</span>
            </p>
          </div>
        </div>

        {/* Dynamic Badge */}
        <div className="flex items-center space-x-2 bg-white border border-[#E6E6DF] px-4 py-2.5 rounded-2xl h-12">
          <div className="w-6 h-6 rounded-full bg-[#5A5A40] overflow-hidden flex items-center justify-center text-[10px] font-bold text-white uppercase font-sans">
            EM
          </div>
          <span className="text-xs font-semibold text-[#5A5A40]">Active Explorer</span>
        </div>
      </div>
    </header>
  );
}
