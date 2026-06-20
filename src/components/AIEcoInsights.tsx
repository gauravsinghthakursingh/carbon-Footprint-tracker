import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Trophy, Zap, Compass, AlertCircle, Smile } from "lucide-react";
import { CalculatorData, LoggedAction, InsightResult, HighImpactRecommendation } from "../types";

interface AIEcoInsightsProps {
  calculatorData: CalculatorData;
  loggedActions: LoggedAction[];
  onAddAction?: (action: Omit<LoggedAction, "id" | "timestamp">) => void;
}

export default function AIEcoInsights({ calculatorData, loggedActions, onAddAction }: AIEcoInsightsProps) {
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [adoptedIndices, setAdoptedIndices] = useState<Record<number, boolean>>({});

  const getCalcHash = (c: CalculatorData, actions: LoggedAction[]): string => {
    return `${c.carMiles}-${c.carType}-${c.transitMiles}-${c.flightsCount}-${c.dietType}-${c.electricityBill}-${c.cleanGrid}-${c.heatingType}-${c.wasteGeneration}-${c.compost}-actions:${actions.length}`;
  };

  const fetchInsights = async (force: boolean = false) => {
    const currentHash = getCalcHash(calculatorData, loggedActions);
    
    // Check if we have cached insights matching current config to prevent wasteful API spans
    if (!force) {
      const cached = sessionStorage.getItem("terra_insights_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.hash === currentHash && parsed.insights) {
            setInsights(parsed.insights);
            return;
          }
        } catch (e) {
          console.error("Failed to parse static insight cache:", e);
        }
      }
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calculatorData, loggedActions }),
      });

      if (!response.ok) {
        throw new Error("Insights request failed");
      }

      const data = await response.json();
      setInsights(data);
      
      // Cache insights alongside the input parameters hash
      sessionStorage.setItem("terra_insights_cache", JSON.stringify({
        insights: data,
        hash: currentHash
      }));
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Unable to sync some parameters. Displaying optimized locally computed recommendations instead.");
      // Fallback
      const calculatedTons = calculateFallbackFootprint(calculatorData);
      const fallbackResult = {
        summary: "Active eco explorer",
        annualFootprintEstimate: calculatedTons,
        personalizedImpactScore: Math.round(Math.max(15, 100 - (calculatedTons / 16) * 60)),
        highImpactActions: [
          {
            title: "Transition local driving to active cycling",
            category: "Transport" as const,
            estimatedSavings: 800,
            difficulty: "Medium" as const,
            rationale: "With weekly commute miles over 100, switching even 2 days to cycling or foot reduces carbon and increases cardiorespiratory fitness."
          },
          {
            title: "Swap dairy products to oat beverages",
            category: "Diet" as const,
            estimatedSavings: 450,
            difficulty: "Easy" as const,
            rationale: "Replacing cow dairy milk with oat milks reduces agricultural land demands by up to 75% per litre."
          },
          {
            title: "Upgrade to thermostatic cold clothes wash",
            category: "Home" as const,
            estimatedSavings: 280,
            difficulty: "Easy" as const,
            rationale: "By removing water heating requirements during standard laundry loads, you prevent fossil burning at local grid generation hubs."
          }
        ],
        personalizedMessage: "Great job evaluating your carbon details! Keep logging more offsets in your daily dashboard actions."
      };
      setInsights(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  const calculateFallbackFootprint = (c: CalculatorData): number => {
    const carMult = c.carType === "hybrid" ? 0.2 : c.carType === "ev" ? 0.08 : c.carType === "none" ? 0 : 0.42;
    const trans = (Number(c.carMiles) * 52 * carMult + Number(c.transitMiles) * 52 * 0.12 + Number(c.flightsCount) * 600) / 2204.62;
    const home = (Number(c.electricityBill) * 12 * (c.cleanGrid === "yes" ? 0.08 : 0.82)) / 2204.62;
    const diet = c.dietType === "meat-heavy" ? 2.4 : c.dietType === "balanced" ? 1.7 : c.dietType === "vegetarian" ? 1.1 : 0.7;
    const waste = (c.wasteGeneration === "high" ? 0.6 : c.wasteGeneration === "moderate" ? 0.4 : 0.25) * (c.compost === "yes" ? 0.7 : 1);
    return Number((trans + home + diet + waste).toFixed(2));
  };

  // Run on load and whenever calculator values change significantly with 1.2s de-bounce to save API quota
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsights();
    }, 1200);
    return () => clearTimeout(timer);
  }, [
    calculatorData.carMiles,
    calculatorData.carType,
    calculatorData.transitMiles,
    calculatorData.flightsCount,
    calculatorData.dietType,
    calculatorData.electricityBill,
    calculatorData.cleanGrid,
    calculatorData.heatingType,
    calculatorData.wasteGeneration,
    calculatorData.compost,
    loggedActions.length
  ]);

  return (
    <div className="space-y-6" id="ai-insights-component">
      
      {/* Upper score section: Top of natural tones layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Score Card */}
        <div className="md:col-span-4 bg-white border border-[#E6E6DF] rounded-[32px] p-6 text-center flex flex-col justify-between shadow-xs">
          <div className="my-auto py-3">
            <span className="uppercase text-[10px] font-bold tracking-[0.2em] text-[#8C8C70] block mb-2">Climate Rating</span>
            <div className="relative inline-block">
              <h2 className="text-6xl font-serif italic text-[#5A5A40]" id="live-carbon-rating-score">
                {insights ? insights.personalizedImpactScore : "82"}
              </h2>
              <span className="text-[10px] uppercase font-bold text-[#8C8C70] absolute -right-6 bottom-1">/100</span>
            </div>
            <p className="text-xs font-semibold text-[#3A3A2F] mt-2.5">Eco Efficiency Score</p>
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-1.5 text-[#5A5A40] bg-[#FAF9F5] px-3.5 py-2.5 rounded-2xl border border-[#E6E6DF]">
            <Trophy className="w-4 h-4 text-[#D8D8C0]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {insights?.summary || "Eco Practitioner"}
            </span>
          </div>
        </div>

        {/* Personalized Coach Tip box */}
        <div className="md:col-span-8 bg-[#5A5A40] rounded-[32px] p-6 text-[#F5F5F0] flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-[25%] translate-y-[25%] text-white opacity-[0.04]">
            <Sparkles className="w-56 h-56" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-[#D8D8C0] animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Counselor Voice</span>
            </div>
            <p className="text-md sm:text-lg font-serif italic leading-relaxed pr-6">
              {insights ? `"${insights.personalizedMessage}"` : '"One small swap today saves 3kg of carbon this month. Evaluate dietary steps or use green commutes to rapidly optimize your metrics."'}
            </p>
          </div>
          
          <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/10 relative z-10">
            <span className="text-[9px] opacity-75 uppercase tracking-widest font-mono">
              Footprint Estimate: {insights?.annualFootprintEstimate || calculateFallbackFootprint(calculatorData)}t CO₂e/yr
            </span>
            <button
              onClick={() => fetchInsights(true)}
              disabled={loading}
              className="bg-[#F5F5F0] hover:bg-white text-[#5A5A40] rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              Sync AI Tips
            </button>
          </div>
        </div>
      </div>

      {/* Recommended dynamic High impact interventions card */}
      <div className="bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-serif italic text-xl text-[#5A5A40] font-bold">Personalized Strategic Swaps</h3>
            <p className="text-xs text-[#8C8C70] mt-0.5">High-yield carbon interventions chosen for your profile</p>
          </div>
          {insights?.isFallback && (
            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold border border-amber-200/50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3" /> Cached Local Insights
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex flex-col justify-center items-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#5A5A40] animate-spin" />
            <p className="text-xs text-[#8C8C70] font-serif italic">Gemini is analyzing your transportation, home, and waste metrics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="ai-recommendations-grid">
            {(insights?.highImpactActions || []).map((rec, idx) => (
              <div
                key={idx}
                className="bg-[#FAF9F5] border border-[#E6E6DF] rounded-2xl p-5 hover:border-[#8C8C70] transition-colors relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="px-2 py-0.5 bg-white border border-[#E6E6DF] text-[9px] font-bold text-[#8C8C70] uppercase rounded-md">
                      {rec.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      rec.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" :
                      rec.difficulty === "Medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {rec.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#5A5A40] font-sans leading-tight">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-[#8C8C70] leading-relaxed mt-2.5 font-serif italic">
                    {rec.rationale}
                  </p>
                </div>
                
                <div className="mt-5 pt-3.5 border-t border-[#E6E6DF]/50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#8C8C70] font-medium font-sans">Est. Savings</span>
                    <span className="text-xs font-mono font-bold text-[#5A5A40]">
                      -{rec.estimatedSavings} kg / yr
                    </span>
                  </div>
                  {onAddAction && (
                    <button
                      onClick={() => {
                        const dailyKg = Math.max(0.2, Number((rec.estimatedSavings / 365).toFixed(1)));
                        onAddAction({
                          title: rec.title,
                          category: rec.category,
                          kgSaved: dailyKg
                        });
                        setAdoptedIndices((prev) => ({ ...prev, [idx]: true }));
                      }}
                      disabled={adoptedIndices[idx]}
                      className={`w-full py-1.5 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        adoptedIndices[idx]
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-[#5A5A40] hover:bg-[#464632] text-white"
                      }`}
                    >
                      {adoptedIndices[idx] ? (
                        <>
                          <Smile className="w-3.5 h-3.5" />
                          Adopted Today
                        </>
                      ) : (
                        "Log Daily Offset"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
