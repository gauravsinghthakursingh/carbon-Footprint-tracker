import React, { useState, useEffect } from "react";
import { TreePine, Sprout, Award, HelpCircle, Landmark, Leaf, ChevronRight, MessageSquare, Compass, CheckCircle2 } from "lucide-react";
import Header from "./components/Header";
import FootprintCalculator from "./components/FootprintCalculator";
import ActionLogger from "./components/ActionLogger";
import AIEcoInsights from "./components/AIEcoInsights";
import EcoChat from "./components/EcoChat";
import { CalculatorData, LoggedAction } from "./types";
import { DEFAULT_CALCULATOR_VALUES } from "./presets";

export default function App() {
  // 1. Core State
  const [calculatorData, setCalculatorData] = useState<CalculatorData>(() => {
    const cached = localStorage.getItem("terra_calculator");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // use default
      }
    }
    return DEFAULT_CALCULATOR_VALUES;
  });

  const [loggedActions, setLoggedActions] = useState<LoggedAction[]>(() => {
    const cached = localStorage.getItem("terra_logged_actions");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // use empty
      }
    }
    return [];
  });

  const [navigationTab, setNavigationTab] = useState<"overview" | "journal" | "coach">("overview");

  // Save states to localStorage on modifications
  useEffect(() => {
    localStorage.setItem("terra_calculator", JSON.stringify(calculatorData));
  }, [calculatorData]);

  useEffect(() => {
    localStorage.setItem("terra_logged_actions", JSON.stringify(loggedActions));
  }, [loggedActions]);

  const handleCalculatorChange = (newData: CalculatorData) => {
    setCalculatorData(newData);
  };

  const handleAddAction = (action: Omit<LoggedAction, "id" | "timestamp">) => {
    const newAction: LoggedAction = {
      ...action,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    setLoggedActions((prev) => [newAction, ...prev]);
  };

  const handleRemoveAction = (id: string) => {
    setLoggedActions((prev) => prev.filter((act) => act.id !== id));
  };

  // Reset helper
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore default values? This clears logged offsets too.")) {
      setCalculatorData(DEFAULT_CALCULATOR_VALUES);
      setLoggedActions([]);
      localStorage.removeItem("terra_calculator");
      localStorage.removeItem("terra_logged_actions");
      sessionStorage.removeItem("terra_insights");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F0] text-[#3A3A2F] flex flex-col p-4 md:p-8 overflow-x-hidden font-sans select-none selection:bg-[#D8D8C0]">
      {/* Dynamic Header */}
      <Header loggedActions={loggedActions} />

      {/* Primary Navigation Hub matching "Natural Tones" Style */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6DF] pb-4">
        <div className="flex space-x-6 text-xs uppercase tracking-widest font-bold">
          <button
            onClick={() => setNavigationTab("overview")}
            className={`pb-1 border-b-2 transition-all ${
              navigationTab === "overview"
                ? "border-[#5A5A40] text-[#5A5A40]"
                : "border-transparent text-[#8C8C70] hover:text-[#5A5A40]"
            }`}
            id="nav-tab-overview"
          >
            Overview & Hub
          </button>
          <button
            onClick={() => setNavigationTab("journal")}
            className={`pb-1 border-b-2 transition-all ${
              navigationTab === "journal"
                ? "border-[#5A5A40] text-[#5A5A40]"
                : "border-transparent text-[#8C8C70] hover:text-[#5A5A40]"
            }`}
            id="nav-tab-journal"
          >
            Sustain Checklist
          </button>
          <button
            onClick={() => setNavigationTab("coach")}
            className={`pb-1 border-b-2 transition-all ${
              navigationTab === "coach"
                ? "border-[#5A5A40] text-[#5A5A40]"
                : "border-transparent text-[#8C8C70] hover:text-[#5A5A40]"
            }`}
            id="nav-tab-coach"
          >
            Eco Coach Chat
          </button>
        </div>

        <button
          onClick={handleReset}
          className="text-[10px] font-bold uppercase tracking-wider text-[#8C8C70] hover:text-[#5A5A40] transition-colors"
        >
          Reset Session Data
        </button>
      </div>

      {/* Main Two-Column Structure */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Left Column: Interactive Assessment (Sticks nicely on large screens) */}
        <div className="lg:col-span-4 h-full xl:sticky xl:top-6">
          <FootprintCalculator data={calculatorData} onChange={handleCalculatorChange} />
        </div>

        {/* Right Column: Interactive Active Tabs Content */}
        <div className="lg:col-span-8 flex flex-col space-y-8 h-full">
          {navigationTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Dynamic Gemini Strategic Highlights */}
              <AIEcoInsights calculatorData={calculatorData} loggedActions={loggedActions} />

              {/* Mini journal checklist preview quick access */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E6E6DF] p-6 rounded-[32px] flex flex-col justify-between shadow-xs">
                  <div>
                    <h3 className="font-serif italic text-lg font-bold text-[#5A5A40]">Log Offset Actions</h3>
                    <p className="text-xs text-[#8C8C70] mt-1">Keep track of your active swaps, custom composting, and active travel offsets directly.</p>
                  </div>
                  <button
                    onClick={() => setNavigationTab("journal")}
                    className="mt-6 flex items-center justify-between text-xs font-bold text-[#5A5A40] hover:text-[#3A3A2F] border-t border-[#E6E6DF] pt-4 w-full group"
                  >
                    Open Daily Journals
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <div className="bg-white border border-[#E6E6DF] p-6 rounded-[32px] flex flex-col justify-between shadow-xs">
                  <div>
                    <h3 className="font-serif italic text-lg font-bold text-[#5A5A40]">Chat with AI Coach</h3>
                    <p className="text-xs text-[#8C8C70] mt-1">Stuck on carbon emission details? Get quick instructions and answers based on your configurations.</p>
                  </div>
                  <button
                    onClick={() => setNavigationTab("coach")}
                    className="mt-6 flex items-center justify-between text-xs font-bold text-[#5A5A40] hover:text-[#3A3A2F] border-t border-[#E6E6DF] pt-4 w-full group"
                  >
                    Launch Chat Engine
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {navigationTab === "journal" && (
            <div className="h-full animate-fadeIn">
              <ActionLogger
                loggedActions={loggedActions}
                onAddAction={handleAddAction}
                onRemoveAction={handleRemoveAction}
              />
            </div>
          )}

          {navigationTab === "coach" && (
            <div className="h-full animate-fadeIn grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column of Chat Tab: Static Information Tip */}
              <div className="md:col-span-1 bg-[#5A5A40] text-[#F5F5F0] rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden h-[460px]">
                <div>
                  <h3 className="text-lg font-serif italic mb-3">Ask about climate science</h3>
                  <p className="text-xs opacity-85 leading-relaxed">
                    Our AI Consultant calculates actual greenhouse parameters. Ask things like:
                  </p>
                  <ul className="text-[11px] opacity-75 mt-3 space-y-2 list-disc list-inside">
                    <li>Standby device vampire leakage</li>
                    <li>Eectric heating vs gas</li>
                    <li>Biodegradability parameters</li>
                    <li>Global carbon targets</li>
                  </ul>
                </div>
                <div className="text-[10px] opacity-60 uppercase tracking-widest pt-4 border-t border-white/10 font-mono">
                  Contextual knowledge enabled
                </div>
              </div>

              {/* Chat Window */}
              <div className="md:col-span-2">
                <EcoChat calculatorData={calculatorData} loggedActions={loggedActions} />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Elegant Universal Footer */}
      <footer className="mt-auto border-t border-[#E6E6DF] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8C8C70] font-sans">
        <div>
          <span>© 2026 <strong>Terra Climate</strong> Inc. Built using Google Gemini.</span>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-[#5A5A40] transition-colors">Methodology Summary</a>
          <a href="#" className="hover:text-[#5A5A40] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#5A5A40] transition-colors">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
}
