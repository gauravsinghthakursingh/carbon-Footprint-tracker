import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Mail, Lock, User, RefreshCw, KeyRound, Sparkles, Check, AlertCircle } from "lucide-react";
import { UserProfile } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, token: string, state: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Avatar generator logic
  const [avatarSeed, setAvatarSeed] = useState(() => Math.random().toString(36).substring(3, 8));
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Live password strength evaluation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-gray-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 20, label: "Extremely Weak", color: "bg-rose-500" };
      case 2:
        return { score: 40, label: "Weak", color: "bg-orange-500" };
      case 3:
        return { score: 60, label: "Fair", color: "bg-amber-500" };
      case 4:
        return { score: 80, label: "Strong", color: "bg-emerald-500" };
      case 5:
        return { score: 100, label: "Elite/Secure", color: "bg-teal-500" };
      default:
        return { score: 10, label: "Insecure", color: "bg-rose-600" };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Dynamic validations before sending
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMsg("Please enter a technically valid email address.");
      return;
    }
    if (activeTab === "register" && username.trim().length < 3) {
      setErrorMsg("Username must be at least 3 character strings long.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password security rules require minimum 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = activeTab === "login" 
        ? { email, password } 
        : { username, email, password, avatarUrl };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication procedure failed.");
      }

      setSuccessMsg(activeTab === "login" ? "Login successful! Synced." : "Account provisioned successfully!");
      
      // Artificial slight delay for pristine visual feel
      setTimeout(() => {
        onAuthSuccess(data.user, data.token, data.state);
        setIsLoading(false);
        onClose();
      }, 500);

    } catch (err: any) {
      setErrorMsg(err.message || "Ecosystem server error.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn" id="auth-overlay-modal">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-md bg-white border border-[#E6E6DF] rounded-[36px] overflow-hidden shadow-2xl relative"
        id="auth-modal-card"
      >
        {/* Decorative close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#E6E6DF] flex items-center justify-center text-[#8C8C70] hover:text-[#5A5A40] transition-colors cursor-pointer"
          aria-label="Close credentials popup"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Banner */}
        <div className="p-6 pb-4 bg-[#FAF9F5] border-b border-[#E6E6DF] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#5A5A40] flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-vintage italic text-xl font-bold text-[#5A5A40]">Ecosystem Sync</h2>
            <p className="text-[10px] text-[#8C8C70] uppercase tracking-widest font-bold">Secure Pro Authentication</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Tab Selector Toggle */}
          <div className="flex bg-[#F5F5F0] rounded-full p-1.5 mb-6 border border-[#E6E6DF] relative">
            <button
              onClick={() => { setActiveTab("login"); setErrorMsg(null); }}
              className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-full py-2 transition-all cursor-pointer ${
                activeTab === "login" 
                  ? "bg-[#5A5A40] text-white shadow-sm" 
                  : "text-[#8C8C70] hover:text-[#5A5A40]"
              }`}
              type="button"
              id="auth-tab-login"
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("register"); setErrorMsg(null); }}
              className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-full py-2 transition-all cursor-pointer ${
                activeTab === "register" 
                  ? "bg-[#5A5A40] text-white shadow-sm" 
                  : "text-[#8C8C70] hover:text-[#5A5A40]"
              }`}
              type="button"
              id="auth-tab-register"
            >
              Create State
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4" id="auth-credentials-form">
            <AnimatePresence mode="wait">
              {activeTab === "register" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                  key="register-fields"
                >
                  {/* Avatar picker segment */}
                  <div className="bg-[#FAF9F5] rounded-2xl p-3 border border-[#E6E6DF]/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full border border-[#D8D8C0] bg-white overflow-hidden flex items-center justify-center p-1">
                        <img src={avatarUrl} alt="Ecosystem Avatar Profile" referrerPolicy="no-referrer" className="w-full h-full" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C70] block">Generated Avatar</span>
                        <span className="text-xs font-semibold text-[#5A5A40]">Custom Sync Agent</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAvatarSeed(Math.random().toString(36).substring(3, 8))}
                      className="p-1.5 rounded-lg border border-[#E6E6DF] bg-white text-[#5A5A40] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                      title="Generate new avatar vector style"
                      type="button"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Username */}
                  <div className="relative">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C70] mb-1.5 block">Ecosystem Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-[#8C8C70]">
                        <User className="w-4 h-4" />
                      </span>
                      <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. CarbonWarrior88"
                        className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF9F5] border border-[#E6E6DF] rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition-colors"
                        required={activeTab === "register"}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div className="relative">
              <label className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C70] mb-1.5 block">Email Account</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#8C8C70]">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ecosession.org"
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF9F5] border border-[#E6E6DF] rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="text-[10px] uppercase tracking-wider font-bold text-[#8C8C70] mb-1.5 block">Passphrase Lock</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#8C8C70]">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF9F5] border border-[#E6E6DF] rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition-colors"
                  required
                />
              </div>

              {/* Password strength visual meter - registration only */}
              {activeTab === "register" && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#8C8C70]">Passphrase Entropy:</span>
                    <span className="font-bold text-[#5A5A40]">{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${strength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.score}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Error Indicator */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2"
                role="alert"
                id="auth-error-box"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Dynamic Success Indicator */}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-teal-50 border border-teal-200 text-teal-700 text-xs rounded-xl flex items-start gap-2"
                id="auth-success-box"
              >
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5A5A40] text-white hover:bg-[#3A3A2F] py-3 text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              id="auth-submit-btn"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{activeTab === "login" ? "Verify Credentials" : "Initialize Account"}</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <p className="text-[10px] text-[#8C8C70] leading-relaxed text-center mt-6">
            <KeyRound className="w-3 h-3 inline mr-1 opacity-80" />
            Passwords salted and encrypted with 100,000 iterations PBKDF2 hash scheme synchronously on transit.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
