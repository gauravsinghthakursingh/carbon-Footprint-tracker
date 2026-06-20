import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Bot, HelpCircle, RefreshCw, Leaf } from "lucide-react";
import { ChatMessage, CalculatorData, LoggedAction } from "../types";

interface FloatingChatBotProps {
  calculatorData: CalculatorData;
  loggedActions: LoggedAction[];
}

export default function FloatingChatBot({ calculatorData, loggedActions }: FloatingChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "f-welcome",
      sender: "coach",
      text: "Hello! I am your Free Gemini AI Eco Coach. I'm here 24/7 to answer your environmental sustainability, carbon footprint, and eco-friendly habit questions. Try clicking one of the suggestions below!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShowBadge(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current && typeof scrollRef.current.scrollIntoView === "function") {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
          chatHistory: messages.map((m) => ({ 
            role: m.sender === "user" ? "user" : "model", 
            parts: [{ text: m.text }] 
          }))
        })
      });

      if (!response.ok) {
        throw new Error("HTTP chat service issue");
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
      console.error("Floating Chat error:", error);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "coach",
        text: "I experienced a minor connection hiccup. Quick energy tip: lower your home thermostat by just 1°C to save up to 8% of heating carbon density annually!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    "Beef vs vegetarian diet savings?",
    "How to stop standby power draw?",
    "Best ways to carbon offset flights?",
    "Easy composting tips at home"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none font-sans" id="floating-eco-chatbot">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="mb-4 w-90 sm:w-104 bg-white border border-[#E6E6DF] rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[525px]"
            id="floating-chat-container"
          >
            {/* Chat Box Header banner details */}
            <div className="p-4 bg-[#5A5A40] text-[#FAF9F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif-vintage italic text-md font-bold">Gemini Eco Coach</h3>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] px-1.5 py-0.2 rounded-full font-mono uppercase tracking-wider font-bold">
                      FREE BOT
                    </span>
                  </div>
                  <span className="text-[10px] opacity-75 block">AI-driven sustainability companion</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-[#FAF9F5]/80 hover:text-white transition-colors cursor-pointer"
                title="Minimize chat conversation"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Message Scrollport space area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F5] space-y-3.5 scrollbar-card" id="floating-chat-messages">
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
                        ? "bg-[#5A5A40] text-white rounded-br-none font-medium"
                        : "bg-white text-[#3A3A2F] border border-[#E6E6DF] rounded-bl-none font-serif italic"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[8px] text-[#8C8C70] mt-1 font-mono tracking-wider px-1">{m.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 bg-white border border-[#E6E6DF] rounded-2xl rounded-bl-none p-3.5 max-w-[150px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-bounce delay-300" />
                  <span className="text-[10px] font-mono text-[#8C8C70] italic">Eco Coach thinking...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Quick action question chips segment */}
            <div className="p-3 bg-white border-t border-[#E6E6DF] space-y-1.5 shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C8C70] block flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#5A5A40]" /> Choose question prompt:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="text-left text-[10px] p-2 bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#E6E6DF] rounded-xl text-[#5A5A40] font-semibold transition-colors truncate cursor-pointer"
                    title={q}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input segment message transmission prompt */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
              className="p-3 bg-[#FAF9F5] border-t border-[#E6E6DF] flex gap-2 shrink-0"
              id="floating-chat-form"
            >
              <input 
                type="text"
                placeholder="Ask our Free AI: 'Is gas heating bad?'"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow p-2.5 bg-white border border-[#D8D8C0] text-[#3A3A2F] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                disabled={isLoading}
                id="floating-chat-input"
                aria-label="Type climate or calculator help question"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-[#5A5A40] hover:bg-[#474732] text-white rounded-xl flex items-center justify-center transition-colors shadow-xs cursor-pointer focus:ring-1 focus:ring-offset-1 focus:ring-[#5A5A40] disabled:opacity-50"
                disabled={!inputText.trim() || isLoading}
                id="floating-chat-submit"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#5A5A40] hover:bg-[#3A3A2F] text-white rounded-full flex items-center justify-center shadow-2xl relative cursor-pointer border border-[#EAEAD7]/10"
        aria-label="Open persistent Free AI Eco Chat Bot"
        title="Persistently ask your Free AI assistant anything"
        id="floating-chatbot-trigger"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -95, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 95, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 95, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              {showBadge && (
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 border border-white text-white font-bold text-[7px] font-mono rounded-full px-1 py-0.2 tracking-wider flex items-center justify-center">
                  FREE AI
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
