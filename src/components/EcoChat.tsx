import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Bot, HelpCircle } from "lucide-react";
import { ChatMessage, CalculatorData, LoggedAction } from "../types";

interface EcoChatProps {
  calculatorData: CalculatorData;
  loggedActions: LoggedAction[];
}

export default function EcoChat({ calculatorData, loggedActions }: EcoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "coach",
      text: "Hello! I am your AI Eco Coach. Based on your current carbon configurations and logged actions, I can provide custom energy, transport, and recycling advice. Go ahead and ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          calculatorData,
          loggedActions,
          chatHistory: messages.map((m) => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] }))
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error of Chat API");
      }

      const data = await response.json();
      
      const coachMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "coach",
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "coach",
        text: "I am having temporary trouble checking the live climate matrix. Small tip: switching off home standby appliances saves roughly 0.5kg block daily!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputText);
    }
  };

  const QUICK_QUESTIONS = [
    "How does beef diet affect carbon vs plants?",
    "Best home thermostat parameters to save CO2?",
    "Why does composting avoid dangerous methane?",
    "Explain standard aviation combustion kg multipliers."
  ];

  return (
    <div className="bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col h-[460px]" id="carbon-ai-chat">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E6E6DF]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#5A5A40] flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif italic font-bold text-[#5A5A40]">AI Eco Consultant</h3>
            <p className="text-[10px] text-[#8C8C70]">Tailored guidance on your carbon profile</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F5F5F0] border border-[#E6E6DF] rounded-lg">
          <span className="w-2 h-2 rounded-full bg-[#5A5A40] animate-bounce" />
          <span className="text-[9px] font-mono font-bold text-[#5A5A40] uppercase">Live Coach</span>
        </div>
      </div>

      {/* Message Output Container */}
      <div className="flex-1 overflow-y-auto mb-4 p-3 bg-[#FAF9F5] border border-[#E6E6DF]/65 rounded-2xl space-y-3 scrollbar-card">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-[#5A5A40] text-white rounded-br-none"
                  : "bg-white text-[#3A3A2F] border border-[#E6E6DF] rounded-bl-none font-serif italic"
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-[#8C8C70] mt-1 font-mono">{m.timestamp}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 bg-white border border-[#E6E6DF] rounded-2xl rounded-bl-none p-3 max-w-[150px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-bounce delay-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-bounce delay-300" />
            <span className="text-[10px] font-mono text-[#8C8C70] italic">Thinking...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Questions Quick Grid */}
      {messages.length === 1 && (
        <div className="mb-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C8C70] mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-[#5A5A40]" /> Choose quick focus areas:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="text-left text-[10px] p-2 bg-white hover:bg-[#F5F5F0] border border-[#E6E6DF] rounded-xl text-[#3A3A2F] transition-colors truncate"
                title={q}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a question about carbon tracking..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-xs bg-[#F5F5F0] border border-[#E6E6DF] rounded-xl focus:border-[#5A5A40] outline-hidden placeholder-[#8C8C70]/60 text-[#3A3A2F]"
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
          className="w-10 h-10 bg-[#5A5A40] hover:bg-[#4A4A33] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-xs shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
