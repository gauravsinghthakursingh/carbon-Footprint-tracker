import React from "react";
import { Trees, Sparkles, Flame, Sprout, Award, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { LoggedAction, UserProfile } from "../types";

interface HeaderProps {
  loggedActions: LoggedAction[];
  currentUser: UserProfile | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export default function Header({ loggedActions, currentUser, onLoginClick, onLogoutClick }: HeaderProps) {
  const totalKgSaved = loggedActions.reduce((sum, action) => sum + action.kgSaved, 0);
  
  // 1 tree absorbs approx 20kg of CO2 per year.
  const treesEquivalent = totalKgSaved / 20;

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white border border-[#E6E6DF] rounded-[32px] p-6 shadow-sm relative overflow-hidden" id="dashboard-header">
      {/* Dynamic Background Organic Accent */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 text-[#5A5A40] opacity-[0.03] select-none pointer-events-none">
        <Sprout className="w-80 h-80 animate-pulse" />
      </div>

      <div className="flex items-center space-x-3 relative z-10 w-full md:w-auto">
        <motion.div 
          className="w-12 h-12 bg-[#5A5A40] rounded-full flex items-center justify-center shadow-sm"
          whileHover={{ scale: 1.1, rotate: 15 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <Sprout className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif-vintage italic font-bold tracking-tight text-[#5A5A40]">Terra</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F5F5F0] text-[#8C8C70] rounded-md border border-[#E6E6DF] font-semibold transition-all hover:bg-[#5A5A40] hover:text-white cursor-pointer">
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
        <motion.div 
          className="flex items-center space-x-3 bg-[#F5F5F0] border border-[#E6E6DF] px-4 py-2.5 rounded-2xl min-w-[130px]"
          whileHover={{ y: -2, borderColor: "#5A5A40" }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 rounded-full bg-[#D8D8C0] flex items-center justify-center text-[#5A5A40]">
            <Sparkles className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C70] leading-none">Offset Today</p>
            <motion.p 
              key={totalKgSaved}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-serif-vintage italic font-bold text-[#5A5A40] mt-0.5" 
              id="co2-offset-header"
            >
              {totalKgSaved.toFixed(1)} <span className="text-[10px] font-sans text-[#8C8C70]">kg</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Dynamic Metric: Tree Absorption */}
        <motion.div 
          className="flex items-center space-x-3 bg-[#F5F5F0] border border-[#E6E6DF] px-4 py-2.5 rounded-2xl min-w-[130px]"
          whileHover={{ y: -2, borderColor: "#5A5A40" }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
            <Trees className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C70] leading-none">Tree Absorbed</p>
            <motion.p 
              key={treesEquivalent}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-serif-vintage italic font-bold text-[#5A5A40] mt-0.5"
            >
              {treesEquivalent.toFixed(2)} <span className="text-[10px] font-sans text-[#8C8C70]">/ yr</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Auth Sync Credentials Section */}
        {currentUser ? (
          <div className="flex items-center space-x-3 bg-white border border-[#E6E6DF] px-4 py-2 rounded-2xl h-12 relative group" id="header-user-profile">
            <div className="w-8 h-8 rounded-full border border-[#D8D8C0] bg-[#FAF9F5] overflow-hidden flex items-center justify-center p-0.5">
              <img src={currentUser.avatarUrl} alt="Ecosystem Avatar" referrerPolicy="no-referrer" className="w-full h-full" />
            </div>
            <div className="flex flex-col select-none pr-8">
              <span className="text-[11px] font-bold text-[#5A5A40] leading-none flex items-center gap-1">
                {currentUser.username}
                <span className="text-[8px] font-mono px-1 bg-amber-100 text-amber-800 rounded-sm">
                  {currentUser.points} pts
                </span>
              </span>
              <span className="text-[8px] text-[#8C8C70] font-semibold mt-0.5 max-w-[120px] truncate">
                {currentUser.level}
              </span>
            </div>
            
            <button 
              onClick={onLogoutClick}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[9px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer duration-200"
              title="Sign out of database session"
              type="button"
            >
              Exit
            </button>
          </div>
        ) : (
          <motion.button 
            onClick={onLoginClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 bg-[#5A5A40] hover:bg-[#3A3A2F] text-white border border-transparent px-4 py-2.5 rounded-2xl h-12 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            id="header-signin-btn"
            type="button"
          >
            <Award className="w-4 h-4 text-emerald-300 mr-0.5" />
            <span>Login & Sync</span>
          </motion.button>
        )}
      </div>
    </header>
  );
}
