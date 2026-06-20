import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardCheck, Sparkles, HelpCircle, FileCheck, RefreshCw, PenTool, Calendar, ShieldCheck, Download, Mail, Check } from "lucide-react";
import { CalculatorData } from "../types";

interface GreenPledgeProps {
  calculatorData: CalculatorData;
}

export default function GreenPledge({ calculatorData }: GreenPledgeProps) {
  const [pledgerName, setPledgerName] = useState("");
  const [targetPledge, setTargetPledge] = useState("Decarbonization Pioneer (Reduce transport footprint by 50%)");
  const [customPledgeText, setCustomPledgeText] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [stampColor, setStampColor] = useState("#5A5A40");
  const [certificateId, setCertificateId] = useState("");
  const [copied, setCopied] = useState(false);

  const PLEDGE_OPTIONS = [
    { label: "Decarbonization Pioneer", value: "Decarbonization Pioneer (Reduce transport footprint by 50%)", hint: "Aims to significantly minimize flight miles and gas-vehicle commutes." },
    { label: "Circular Eco Citizen", value: "Circular Eco Citizen (Achieve composting & zero organic waste)", hint: "Commits to compost daily and practice strict waste sorting." },
    { label: "Grid Purist Vanguard", value: "Grid Purist Vanguard (Enforce 100% renewable grid power)", hint: "Ensures utilities are sourced from clean solar, wind or bio-grids." },
    { label: "Carbon Minimalist Champion", value: "Carbon Minimalist Champion (Maintain under 4.0 tons CO2 / yr)", hint: "Locks in an ultra-low impact diet and extreme efficiency standards." }
  ];

  const handleGeneratePledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgerName.trim()) return;

    // Generate a beautiful, authentic serial key
    const year = new Date().getFullYear();
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    setCertificateId(`TERRA-${year}-${randomHex}`);
    setCopied(false);
    setIsLocked(true);
  };

  const handleResetPledge = () => {
    setIsLocked(false);
    setPledgerName("");
    setCustomPledgeText("");
    setCopied(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(certificateId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col justify-between" id="green-pledge-module">
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-[#5A5A40] mb-2">
          <ShieldCheck className="w-5 h-5 text-[#5A5A40]" />
          <h3 className="font-serif-vintage italic text-xl font-bold leading-none">Terra Green Commitments</h3>
        </div>
        <p className="text-xs text-[#8C8C70] leading-relaxed">
          Formulate your personalized, legal-inspired ecological conservation pledge. Generate a signed digital credential seal honoring your long-term sustainability goal.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isLocked ? (
          <motion.form
            key="pledge-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleGeneratePledge}
            className="space-y-4"
          >
            {/* Input Name field */}
            <div>
              <label htmlFor="pledger-authority-name" className="block text-[10px] font-bold uppercase text-[#8C8C70] tracking-wider mb-1.5">
                Pledger Name / Authority
              </label>
              <input
                id="pledger-authority-name"
                type="text"
                required
                maxLength={40}
                placeholder="Enter your full name (e.g. Gaurav Singh)"
                value={pledgerName}
                onChange={(e) => setPledgerName(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-[#FAF9F5] border border-[#E6E6DF] rounded-2xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-hidden text-[#3A3A2F]"
              />
            </div>

            {/* Target Select field */}
            <div>
              <span className="block text-[10px] font-bold uppercase text-[#8C8C70] tracking-wider mb-2">
                Choose Climate Milestones
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-label="Climate Milestones">
                {PLEDGE_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      setTargetPledge(option.value);
                      setCustomPledgeText("");
                    }}
                    aria-pressed={targetPledge === option.value && !customPledgeText}
                    className={`p-3 text-left rounded-2xl border text-xs transition-all flex flex-col justify-between h-24 ${
                      targetPledge === option.value && !customPledgeText
                        ? "bg-[#5A5A40] border-[#5A5A40] text-[#FAF9F5] shadow-xs"
                        : "bg-white border-[#E6E6DF] text-[#3A3A2F] hover:bg-[#FAF9F5]/80"
                    }`}
                  >
                    <span className="font-bold block tracking-tight">{option.label}</span>
                    <span className={`text-[9.5px] mt-1.5 leading-snug block line-clamp-2 ${
                      targetPledge === option.value && !customPledgeText ? "text-white/80" : "text-[#8C8C70]"
                    }`}>
                      {option.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom pledge field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="custom-pledge-covenant" className="block text-[10px] font-bold uppercase text-[#8C8C70] tracking-wider">
                  Or Write a Custom Carbon Covenant
                </label>
                <span className="text-[9px] text-[#A6A690] italic">Optional override</span>
              </div>
              <textarea
                id="custom-pledge-covenant"
                placeholder="e.g. I promise to avoid taking fossil fuel vehicles for commutes shorter than 5 kilometers and compost all domestic food leftovers."
                value={customPledgeText}
                onChange={(e) => {
                  setCustomPledgeText(e.target.value);
                }}
                className="w-full px-4 py-3 text-xs bg-[#FAF9F5] border border-[#E6E6DF] rounded-2xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-hidden text-[#3A3A2F] h-20 resize-none"
              />
            </div>

            {/* Custom choice for Seal stamp colors */}
            <div className="flex items-center space-x-4 pt-1">
              <span className="text-[10px] uppercase font-bold text-[#8C8C70]">Credentials Seal Tint:</span>
              <div className="flex space-x-2" role="radiogroup" aria-label="Credentials Seal Tint">
                {[
                  { hex: "#5A5A40", name: "Olive Green" },
                  { hex: "#8C2A2F", name: "Crimson Red" },
                  { hex: "#1F4E5B", name: "Deep Navy" },
                  { hex: "#A37A3D", name: "Eco Gold" }
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setStampColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    role="radio"
                    aria-checked={stampColor === color.hex}
                    aria-label={`Seal Color choice: ${color.name}`}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      stampColor === color.hex ? "scale-125 border-[#3A3A2F]" : "border-transparent"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-[#5A5A40] hover:bg-[#4A4A33] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Engrave Authorized Green Alliance
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="pledge-certificate"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex flex-col items-center space-y-6"
          >
            {/* The Certificate Card */}
            <div className="w-full bg-[#FAF9F4] border-8 border-double border-[#D8D8C0] rounded-3xl p-6 md:p-8 relative overflow-hidden select-none shadow-md">
              {/* Internal Accent frame lines */}
              <div className="absolute inset-2 border border-[#E6E6DF]/80 pointer-events-none" />
              
              {/* Subtle background graphics */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#5A5A40]/[0.02] pointer-events-none">
                <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                </svg>
              </div>

              {/* Certificate content */}
              <div className="text-center space-y-4 relative z-10">
                <span className="text-[9px] font-mono tracking-widest font-extrabold text-[#8C8C70] border border-[#E6E6DF] px-2.5 py-0.5 rounded-md bg-white">
                  COVENANT OF RECOVERY
                </span>
                
                <h4 className="font-serif-vintage italic text-2xl font-bold text-[#5A5A40] leading-tight">
                  Certificate of Ecological Commitment
                </h4>
                
                <p className="text-[10px] text-[#8C8C70] uppercase tracking-wider font-semibold">
                  This doc hereby declares that
                </p>

                <div className="py-2 border-b-2 border-dashed border-[#D8D8C0]/70 max-w-[280px] mx-auto">
                  <span className="font-serif-vintage font-bold text-xl text-[#3A3A2F]">
                    {pledgerName}
                  </span>
                </div>

                <p className="text-[10px] text-[#A6A690] leading-relaxed max-w-[340px] mx-auto italic">
                  has formally aligned their individual environmental balance parameters to support resource conservation, executing the milestone pledge target listed below:
                </p>

                <div className="bg-white/80 border border-[#E6E6DF] p-3.5 rounded-2xl max-w-[380px] mx-auto text-xs text-[#3A3A2F] font-bold leading-normal shadow-2xs">
                  "{customPledgeText.trim() ? customPledgeText : targetPledge}"
                </div>

                {/* Bottom Signature area & stamp */}
                <div className="grid grid-cols-2 gap-4 pt-6 items-end max-w-[360px] mx-auto">
                  
                  {/* Signature Brush */}
                  <div className="text-left space-y-1">
                    <span className="text-[8px] uppercase tracking-wider text-[#8C8C70] font-bold block">
                      AUTHORIZED SIGNATURE
                    </span>
                    <div className="font-serif-vintage italic text-[#5A5A40] text-sm font-semibold pl-1">
                      {pledgerName.toLowerCase().replace(/\s+/g, '_')}_eco
                    </div>
                    <div className="h-[1.5px] bg-[#D8D8C0] w-full" />
                    <span className="text-[8px] block font-mono text-[#A6A690]">
                      Dated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Stamp Seal Graphic with custom dynamic color tint */}
                  <div className="flex justify-end">
                    <div
                      className="w-16 h-16 rounded-full border-4 border-dotted flex flex-col items-center justify-center p-1 relative rotate-12 bg-white flex-shrink-0 shadow-2xs"
                      style={{ borderColor: stampColor, color: stampColor }}
                    >
                      <Sparkles className="w-4 h-4 animate-pulse mb-0.5" />
                      <span className="text-[7.5px] font-mono font-bold leading-none select-none tracking-tight text-center uppercase">
                        TERRA<br />APPROVED
                      </span>
                      <div className="absolute inset-0.5 rounded-full border border-dashed border-inherit opacity-45" />
                    </div>
                  </div>

                </div>

                {/* Serial key */}
                <p className="text-[8.5px] font-mono text-[#A6A690] mt-4">
                  VERIFIED CREDENTIAL ID: <span className="font-bold underline text-[#8C8C70]">{certificateId}</span>
                </p>
              </div>
            </div>

            {/* Micro Copied confirmation badge */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200 py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Credentials Copied to Clipboard!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions for the pledge */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 bg-[#FAF9F5] border border-[#E6E6DF] text-[#5A5A40] hover:bg-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Copy Verifiable Code
              </button>
              <button
                type="button"
                onClick={handleResetPledge}
                className="flex-1 bg-[#F5F5F0] border border-dashed border-[#8C8C70]/40 text-[#8C8C70] hover:text-[#5A5A40] py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Draft New Covenant
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
