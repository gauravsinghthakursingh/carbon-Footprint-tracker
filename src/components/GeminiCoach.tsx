import React, { useState, useEffect, useRef } from "react";
import { CalculatorData, LoggedAction, InsightResult, ChatMessage } from "../types";
import { Sparkles, MessageSquare, Send, RefreshCw, Leaf, ArrowRight, ShieldAlert, BadgeCheck, HelpCircle } from "lucide-react";

interface GeminiCoachProps {
  calculatorData: CalculatorData;
  loggedActions: LoggedAction[];
}

export default function GeminiCoach({ calculatorData, loggedActions }: GeminiCoachProps) {
  // Coach insights state
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Chat window state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init-message",
      sender: "coach",
      text: "Hello! I am your server-side Gemini eco-coach. I can explain the carbon calculations behind your profile, suggest smart composting habits, or estimate aviation impacts. What is on your mind?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch initial insights automatically or let user trigger
  const fetchInsights = async () => {
    setLoadingInsights(true);
    setInsightError(null);
    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calculatorData, loggedActions }),
      });
      if (!response.ok) {
        throw new Error("Failed to consult Eco-Advisor");
      }
      const data: InsightResult = await response.json();
      setInsights(data);
    } catch (err: any) {
      console.error(err);
      setInsightError("Could not render custom insights. Check server connection logs.");
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [calculatorData]); // Regenerate insights whenever calculator inputs change!

  // Instant scroll on message appended
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMsg) return;

    const userMsgText = chatInput.trim();
    setChatInput("");
    
    const userMessage: ChatMessage = {
      id: `m-${Math.random()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setSendingMsg(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          calculatorData,
          loggedActions,
          chatHistory: chatMessages.slice(-6).map(m => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Chat transmission failure");
      }

      const resData = await response.json();
      const coachMessage: ChatMessage = {
        id: `m-${Math.random()}`,
        sender: "coach",
        text: resData.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, coachMessage]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Math.random()}`,
          sender: "coach",
          text: "I suffered an interactive connection failure. Try re-sending your question shortly!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <section className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8" id="ai-coach-block">
      
      {/* LEFT: Personalized report & recommendations */}
      <div className="lg:col-span-6 bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col h-full justify-between" id="ai-advisor-panel">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif-vintage italic text-xl text-[#5A5A40] font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
              3. Interactive Advisor Synthesis
            </h3>
            <button
              onClick={fetchInsights}
              className="text-xs text-slate-500 font-bold hover:text-[#5A5A40] flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 transition-colors"
              disabled={loadingInsights}
              title="Request profile re-evaluation"
              id="btn-re-evaluate"
            >
              <RefreshCw className={`w-3 h-3 ${loadingInsights ? "animate-spin" : ""}`} />
              Re-evaluate
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Realtime audit based on active variables. Analyzed directly using modern green estimation algorithms.
          </p>
        </div>

        {loadingInsights ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-[#D8D8C0]">
            <RefreshCw className="w-8 h-8 text-[#5A5A40] animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-600">Generating carbon recommendations...</p>
            <p className="text-xs text-slate-400 mt-1">Analyzing flight density, power draw matrices, and diet coefficients.</p>
          </div>
        ) : insightError ? (
          <div className="flex-grow p-6 bg-rose-50 border border-rose-100/80 rounded-2xl text-center">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-rose-700">{insightError}</p>
            <button
              onClick={fetchInsights}
              className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg"
            >
              Retry Connection
            </button>
          </div>
        ) : insights ? (
          <div className="flex-grow space-y-6" id="insights-body">
            
            {/* Persona Summary badge */}
            <div className="p-4 bg-[#F5F5F0] rounded-2xl border border-[#D8D8C0]/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800 bg-[#E6E6DF] px-2 py-0.5 rounded-md">
                  {insights.summary}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4 text-[#5A5A40]" />
                  Impact Score: <strong className="text-emerald-700">{insights.personalizedImpactScore}/100</strong>
                </span>
              </div>
              <p className="text-xs text-[#3A3A2F] leading-relaxed italic font-serif">
                "{insights.personalizedMessage}"
              </p>
              {insights.isFallback && (
                <div className="mt-2 text-[9px] text-[#8C8C70]/90 font-mono italic">
                  * Live Gemini API is pending setup; currently using high-precision local sustainability formulas.
                </div>
              )}
            </div>

            {/* Recommended high-impact actions list */}
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C70] mb-3">
                Identified Action Items
              </p>
              <div className="space-y-3" id="insights-action-presets">
                {insights.highImpactActions.map((act, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-white border border-[#E6E6DF] rounded-2xl hover:shadow-xs transition-shadow flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold bg-[#E6E6DF] text-[#5A5A40] px-2 py-0.5 rounded-full">
                          {act.category}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          act.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" :
                          act.difficulty === "Medium" ? "bg-amber-50 text-amber-700" :
                          "bg-rose-50 text-rose-700"
                        }`}>
                          {act.difficulty}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">
                          {act.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {act.rationale}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 block lowercase">estimated savings</span>
                      <span className="text-xs font-bold font-mono text-[#5A5A40]">
                        -{act.estimatedSavings} kg/yr
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center min-h-[200px]">
            <button
              onClick={fetchInsights}
              className="px-6 py-2.5 bg-[#5A5A40] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#474732] transition-colors"
            >
              Analyze Carbon Profile
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Live chat panel for discussing actions */}
      <div className="lg:col-span-6 bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col justify-between h-[510px]" id="ai-chat-panel">
        <div>
          <h3 className="font-serif-vintage italic text-xl text-[#5A5A40] font-bold flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-[#5A5A40]" />
            Ask the Eco Coach
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Discuss customized conservation tricks, alternative power steps, or dynamic climate policies.
          </p>
        </div>

        {/* Dialogue scroll space */}
        <div className="flex-grow bg-[#F5F5F0] rounded-2xl p-4 overflow-y-auto mb-4 space-y-3.5 max-h-[300px] border border-[#E6E6DF]/50" id="chat-messages-container">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#5A5A40] text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-[#E6E6DF] rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[8px] text-slate-400 mt-1 font-mono tracking-wider px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
          
          {sendingMsg && (
            <div className="mr-auto items-start max-w-[85%] flex flex-col">
              <div className="bg-white text-slate-500 border border-slate-100 p-3 rounded-2xl rounded-bl-none text-xs flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                Thinking...
              </div>
            </div>
          )}
          
          <div ref={chatBottomRef} />
        </div>

        {/* Inputs form */}
        <form onSubmit={handleSendMessage} className="flex gap-2" id="chat-form">
          <input
            type="text"
            placeholder="Ask: 'How much CO2 does high beef save?'"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-grow p-3 bg-white border border-[#D8D8C0] text-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
            disabled={sendingMsg}
            id="chat-text-input"
          />
          <button
            type="submit"
            className="px-4 bg-[#5A5A40] hover:bg-[#474732] text-white rounded-xl flex items-center justify-center transition-colors shadow-xs"
            disabled={!chatInput.trim() || sendingMsg}
            id="btn-send-message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </section>
  );
}
