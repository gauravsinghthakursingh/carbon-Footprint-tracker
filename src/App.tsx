import React, { useState, useEffect } from "react";
import { TreePine, Sprout, Award, HelpCircle, Landmark, Leaf, ChevronRight, MessageSquare, Compass, CheckCircle2, Trees } from "lucide-react";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import FootprintCalculator from "./components/FootprintCalculator";
import ActionLogger from "./components/ActionLogger";
import AIEcoInsights from "./components/AIEcoInsights";
import EcoChat from "./components/EcoChat";
import FloatingChatBot from "./components/FloatingChatBot";
import OverviewChart from "./components/OverviewChart";
import VirtualForest from "./components/VirtualForest";
import ClimateHub from "./components/ClimateHub";
import GreenPledge from "./components/GreenPledge";
import { CalculatorData, LoggedAction, UserProfile } from "./types";
import { DEFAULT_CALCULATOR_VALUES } from "./presets";

export default function App() {
  // 1. Core State
  const [calculatorData, setCalculatorData] = useState<CalculatorData>(() => {
    const cached = localStorage.getItem("terra_calculator");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) return parsed;
      } catch (e) {
        console.error("Failed to parse calculator state:", e);
      }
    }
    return DEFAULT_CALCULATOR_VALUES;
  });

  const [loggedActions, setLoggedActions] = useState<LoggedAction[]>(() => {
    const cached = localStorage.getItem("terra_logged_actions");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) return parsed;
      } catch (e) {
        console.error("Failed to parse logged actions state:", e);
      }
    }
    return [];
  });

  const [navigationTab, setNavigationTab] = useState<"overview" | "journal" | "garden" | "coach">("overview");

  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("terra_auth_token"));
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load session from token on startup (Pro-level Security & persistence)
  useEffect(() => {
    async function loadSession() {
      if (!token) return;
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.user) {
          setCurrentUser(data.user);
          if (data.state && data.state.calculatorData && data.state.calculatorData.carType !== "none") {
            setCalculatorData(data.state.calculatorData);
            if (data.state.loggedActions) {
              setLoggedActions(data.state.loggedActions);
            }
          } else {
            // First time sync guest progress to server
            await fetch("/api/state/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ calculatorData, loggedActions })
            });
          }
        } else {
          localStorage.removeItem("terra_auth_token");
          setToken(null);
        }
      } catch (err) {
        console.error("Authentication session fetch failed:", err);
      }
    }
    loadSession();
  }, [token]);

  // Save guest states locally to localStorage as fallback
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("terra_calculator", JSON.stringify(calculatorData));
    }
  }, [calculatorData, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("terra_logged_actions", JSON.stringify(loggedActions));
    }
  }, [loggedActions, currentUser]);

  // Synchronize state to backend database on modifications when logged in (Debounced Sync)
  useEffect(() => {
    if (currentUser && token) {
      const delaySync = setTimeout(async () => {
        try {
          const response = await fetch("/api/state/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ calculatorData, loggedActions })
          });
          const data = await response.json();
          if (response.ok && data.user) {
            setCurrentUser(data.user);
          }
        } catch (e) {
          console.error("Failed to sync carbon profile stats:", e);
        }
      }, 1000);

      return () => clearTimeout(delaySync);
    }
  }, [calculatorData, loggedActions, currentUser, token]);

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

  const handleAuthSuccess = (user: UserProfile, newToken: string, state: any) => {
    localStorage.setItem("terra_auth_token", newToken);
    setToken(newToken);
    setCurrentUser(user);
    if (state) {
      if (state.calculatorData && state.calculatorData.carType !== "none") {
        setCalculatorData(state.calculatorData);
      }
      if (state.loggedActions) {
        setLoggedActions(state.loggedActions);
      }
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Logout report failed:", e);
      }
    }
    localStorage.removeItem("terra_auth_token");
    setToken(null);
    setCurrentUser(null);
    setCalculatorData(DEFAULT_CALCULATOR_VALUES);
    setLoggedActions([]);
  };

  // Reset helper
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore default values? This clears logged offsets too.")) {
      setCalculatorData(DEFAULT_CALCULATOR_VALUES);
      setLoggedActions([]);
      localStorage.removeItem("terra_calculator");
      localStorage.removeItem("terra_logged_actions");
      sessionStorage.removeItem("terra_insights_cache");
      if (currentUser) {
        handleLogout();
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F0] text-[#3A3A2F] flex flex-col p-4 md:p-8 overflow-x-hidden font-sans select-none selection:bg-[#D8D8C0] relative">
      {/* Decorative premium ambient glow nodes */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#EAEAD7] rounded-full blur-[130px] opacity-40 pointer-events-none -translate-y-1/2 z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#E6E6DF] rounded-full blur-[110px] opacity-30 pointer-events-none z-0" />

      <div className="w-full max-w-7xl mx-auto z-10 flex flex-col flex-1">
        {/* Dynamic Header */}
        <Header 
          loggedActions={loggedActions} 
          currentUser={currentUser}
          onLoginClick={() => setIsAuthOpen(true)}
          onLogoutClick={handleLogout}
        />

        {/* Primary Navigation Hub matching "Natural Tones" Style */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6DF] pb-4" role="tablist" aria-label="Sustainable Ecosystem Navigation Tabs">
          <div className="flex flex-wrap gap-4 md:gap-6 text-xs uppercase tracking-widest font-bold">
            <button
              onClick={() => setNavigationTab("overview")}
              role="tab"
              aria-selected={navigationTab === "overview"}
              className={`pb-1.5 border-b-2 transition-all flex items-center gap-1.5 ${
                navigationTab === "overview"
                  ? "border-[#5A5A40] text-[#5A5A40]"
                  : "border-transparent text-[#8C8C70] hover:text-[#5A5A40]"
              }`}
              id="nav-tab-overview"
            >
              Overview & Hub
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <button
              onClick={() => setNavigationTab("journal")}
              role="tab"
              aria-selected={navigationTab === "journal"}
              className={`pb-1.5 border-b-2 transition-all flex items-center gap-1.5 ${
                navigationTab === "journal"
                  ? "border-[#5A5A40] text-[#5A5A40]"
                  : "border-transparent text-[#8C8C70] hover:text-[#5A5A40]"
              }`}
              id="nav-tab-journal"
            >
              Sustain Checklist
              {loggedActions.length > 0 && (
                <span className="px-1.5 py-0.5 text-[8px] font-bold font-mono bg-[#E6E6DF] text-[#5A5A40] rounded-full hover:bg-[#5A5A40] hover:text-white transition-colors">
                  {loggedActions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setNavigationTab("garden")}
              role="tab"
              aria-selected={navigationTab === "garden"}
              className={`pb-1.5 border-b-2 transition-all flex items-center gap-1.5 ${
                navigationTab === "garden"
                  ? "border-[#5A5A40] text-[#5A5A40]"
                  : "border-transparent text-[#8C8C70] hover:text-[#5A5A40]"
              }`}
              id="nav-tab-garden"
            >
              Sanctuary & Pledges
              <span className="text-[9.5px] italic font-serif-vintage text-amber-700 font-bold lowercase">wilded</span>
            </button>
            <button
              onClick={() => setNavigationTab("coach")}
              role="tab"
              aria-selected={navigationTab === "coach"}
              className={`pb-1.5 border-b-2 transition-all flex items-center gap-1.5 ${
                navigationTab === "coach"
                  ? "border-[#5A5A40] text-[#5A5A40]"
                  : "border-transparent text-[#8C8C70] hover:text-[#5A5A40]"
              }`}
              id="nav-tab-coach"
            >
              Eco Coach Chat
              <span className="px-1 py-0.5 text-[8px] font-bold text-white bg-[#5A5A40] rounded-sm transform scale-90 tracking-normal font-mono">AI</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            type="button"
            className="text-[10px] font-bold uppercase tracking-wider text-[#8C8C70] hover:text-[#5A5A40] transition-colors"
          >
            Reset Session Data
          </button>
        </div>

        {/* Main Two-Column Structure */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8 z-10">
        
        {/* Left Column: Interactive Assessment (Sticks nicely on large screens) */}
        <div className="lg:col-span-4 h-full xl:sticky xl:top-6">
          <FootprintCalculator data={calculatorData} onChange={handleCalculatorChange} />
        </div>

        {/* Right Column: Interactive Active Tabs Content */}
        <div className="lg:col-span-8 flex flex-col space-y-8 h-full">
          {navigationTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Climate Hub with real-time dynamic ticking counter and achievements */}
              <ClimateHub calculatorData={calculatorData} loggedActions={loggedActions} />

              {/* Dynamic Gemini Strategic Highlights */}
              <AIEcoInsights calculatorData={calculatorData} loggedActions={loggedActions} onAddAction={handleAddAction} />

              {/* Interactive allocation and donut proportions card */}
              <OverviewChart data={calculatorData} />

              {/* Mini journal checklist preview quick access */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E6E6DF] p-6 rounded-[32px] flex flex-col justify-between shadow-xs hover:border-[#D8D8C0] transition-colors group">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E6E6DF] flex items-center justify-center text-[#5A5A40] mb-4">
                      <Trees className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif-vintage italic text-lg font-bold text-[#5A5A40]">Virtual Sanctuary</h3>
                    <p className="text-[11px] text-[#8C8C70] mt-2 leading-relaxed">
                      Behold your interactive forest plot populated dynamically by real-world conservation changes.
                    </p>
                  </div>
                  <button
                    onClick={() => setNavigationTab("garden")}
                    className="mt-6 flex items-center justify-between text-xs font-bold text-[#5A5A40] hover:text-[#3A3A2F] border-t border-[#E6E6DF]/80 pt-4 w-full"
                  >
                    Enter Sanctuary
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <div className="bg-white border border-[#E6E6DF] p-6 rounded-[32px] flex flex-col justify-between shadow-xs hover:border-[#D8D8C0] transition-colors group">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E6E6DF] flex items-center justify-center text-[#5A5A40] mb-4">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif-vintage italic text-lg font-bold text-[#5A5A40]">Sustain Habits</h3>
                    <p className="text-[11px] text-[#8C8C70] mt-2 leading-relaxed">
                      Keep track of your active swaps, eco-friendly cooking, and carbon offsets on our checklist log.
                    </p>
                  </div>
                  <button
                    onClick={() => setNavigationTab("journal")}
                    className="mt-6 flex items-center justify-between text-xs font-bold text-[#5A5A40] hover:text-[#3A3A2F] border-t border-[#E6E6DF]/80 pt-4 w-full"
                  >
                    Open Swaps Board
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <div className="bg-white border border-[#E6E6DF] p-6 rounded-[32px] flex flex-col justify-between shadow-xs hover:border-[#D8D8C0] transition-colors group">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E6E6DF] flex items-center justify-center text-[#5A5A40] mb-4">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif-vintage italic text-lg font-bold text-[#5A5A40]">AI Eco Consultant</h3>
                    <p className="text-[11px] text-[#8C8C70] mt-2 leading-relaxed">
                      Get immediate precise ecological data answers customized exactly to your footprint values.
                    </p>
                  </div>
                  <button
                    onClick={() => setNavigationTab("coach")}
                    className="mt-6 flex items-center justify-between text-xs font-bold text-[#5A5A40] hover:text-[#3A3A2F] border-t border-[#E6E6DF]/80 pt-4 w-full"
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

          {navigationTab === "garden" && (
            <div className="h-full animate-fadeIn space-y-8">
              <VirtualForest loggedActions={loggedActions} />
              <GreenPledge calculatorData={calculatorData} />
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

      {/* Account Verification Modal popup */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

      {/* Persistent Free AI Eco Eco-Assistant Chat Bot segment */}
      <FloatingChatBot 
        calculatorData={calculatorData} 
        loggedActions={loggedActions} 
      />
    </div>
  );
}
