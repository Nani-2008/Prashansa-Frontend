import React, { useState, useRef, useLayoutEffect } from "react";
import { Phone, Lock, ChevronRight, Check, RefreshCw, AlertCircle, User } from "lucide-react";
import * as api from "../../api/client.js";
import RevealOnScroll from "../RevealOnScroll";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = ({ t, handleLogin, defaultTab = "signin" }) => {
  const [activeTab, setActiveTab] = useState(defaultTab); // "signin" or "signup"

  const [navSliderStyle, setNavSliderStyle] = useState({ left: 0, width: 0 });
  const navContainerRef = useRef(null);
  const navButtonRefs = useRef({});

  useLayoutEffect(() => {
    const activeButton = navButtonRefs.current[activeTab];
    if (activeButton && navContainerRef.current) {
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setNavSliderStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  const [errorPopup, setErrorPopup] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const showError = (msg) => {
    setErrorPopup(msg);
    setTimeout(() => setErrorPopup(""), 4000);
  };

  const onSubmit = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      showError("Please enter a valid 10-digit phone number");
      return;
    }

    if (!formData.password) {
      showError("Please enter your password");
      return;
    }

    if (activeTab === "signup") {
      if (!formData.name.trim()) {
        showError("Please enter your name");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showError("Passwords do not match");
        return;
      }
    }

    if (captchaInput.toUpperCase() !== captcha) {
      setCaptchaError('CAPTCHA does not match. Please try again.');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
      return;
    }
    setCaptchaError('');

    setSubmitting(true);
    try {
      // Get live location before sending request
      let locationStr = "";
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          })
        );
        locationStr = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      } catch {
        // Location unavailable — proceed without it
      }

      let user;
      if (activeTab === "signin") {
        user = await api.login({
          phone: formData.phone,
          password: formData.password,
          location: locationStr
        });
      } else {
        user = await api.register({
          phone: formData.phone,
          password: formData.password,
          name: formData.name,
          location: locationStr
        });
      }
      await handleLogin(user);
    } catch (e) {
      showError(e.message || "Authentication failed");
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (formData.phone.length !== 10) return false;
    if (!formData.password) return false;
    if (captchaInput.length < 6) return false;
    if (activeTab === "signup") {
      if (!formData.name.trim()) return false;
      if (formData.password !== formData.confirmPassword) return false;
    }
    return true;
  };

  return (
    <div className="flex justify-center items-center py-16 px-4 bg-[#fbfbfd] dark:bg-transparent relative">

      {/* Error Popup Toast */}
      <AnimatePresence>
        {errorPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-[100] bg-red-50 text-red-700 border border-red-200 px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(239,68,68,0.15)] font-semibold flex items-center gap-3 backdrop-blur-md"
          >
            <div className="bg-red-100 p-1.5 rounded-full text-red-600">
              <AlertCircle size={18} strokeWidth={3} />
            </div>
            {errorPopup}
          </motion.div>
        )}
      </AnimatePresence>

      <RevealOnScroll delay={60} y={20} blur={12}>
        <div className="w-full max-w-md bg-white dark:bg-[#1e2333]/70 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-white/10 p-8 sm:p-10 relative overflow-hidden">

          {/* Tabs */}
          <div ref={navContainerRef} className="flex w-full mb-8 bg-[#f5f5f7] dark:bg-[#121212] rounded-full p-1 border border-gray-200 dark:border-white/10 relative">
            <div
              className="absolute top-1 bottom-1 bg-white dark:bg-[#1c1c1e] shadow-sm rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0"
              style={{
                left: `${navSliderStyle.left}px`,
                width: `${navSliderStyle.width}px`
              }}
            />
            <button
              ref={(el) => (navButtonRefs.current["signin"] = el)}
              onClick={() => { setActiveTab("signin"); setCaptchaError(''); setErrorPopup(''); }}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 ${activeTab === "signin" ? 'text-[#1d1d1f] dark:text-white' : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              ref={(el) => (navButtonRefs.current["signup"] = el)}
              onClick={() => { setActiveTab("signup"); setCaptchaError(''); setErrorPopup(''); }}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 ${activeTab === "signup" ? 'text-[#1d1d1f] dark:text-white' : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-3">
              {activeTab === "signup" ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">
              {activeTab === "signup" ? 'Register to report incidents securely' : 'Enter your credentials to login'}
            </p>
          </div>

          <form className="space-y-5">

            {/* Phone */}
            <div>
              <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
                {t.phoneNumber} <span className="text-red-500"></span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-[#0066cc]">
                  <Phone size={18} className="text-current" />
                </div>
                <div className="absolute inset-y-0 left-11 flex items-center pointer-events-none">
                  <span className="text-[#86868b] dark:text-[#a1a1a6] text-[15px]">+91</span>
                </div>
                <input
                  type="tel"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  placeholder="000 000 0000"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: value });
                  }}
                  className="w-full pl-16 pr-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] dark:text-[#a1a1a6]/70 focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 focus:shadow-[0_8px_30px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
                Password <span className="text-red-500"></span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-[#0066cc]">
                  <Lock size={18} className="text-current" />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] dark:text-[#a1a1a6]/70 focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 transition-all duration-300 outline-none"
                />
              </div>
            </div>

            {/* Sign Up Specific Fields */}
            {activeTab === "signup" && (
              <>
                {/* Confirm Password */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
                    Confirm Password <span className="text-red-500"></span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-[#0066cc]">
                      <Lock size={18} className="text-current" />
                    </div>
                    <input
                      type="password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full pl-11 pr-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] dark:text-[#a1a1a6]/70 focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:ring-4 transition-all duration-300 outline-none ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-transparent focus:border-[#0066cc]/40 focus:ring-[#0066cc]/10'
                      }`}
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-[13px] text-red-500 flex items-center gap-1 mt-1 pl-1">
                      <AlertCircle size={14} /> Passwords do not match
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
                    Your Name <span className="text-red-500"></span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-[#0066cc]">
                      <User size={18} className="text-current" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] dark:text-[#a1a1a6]/70 focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 transition-all duration-300 outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Captcha */}
            <div className="space-y-2 pt-2 mb-4">
              <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">Security Verification</label>
              <div className="flex items-center gap-3">
                <div className="px-5 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-[14px] font-mono text-lg tracking-[0.35em] font-bold text-slate-800 select-none border border-slate-200 relative overflow-hidden shadow-inner">
                  <span className="relative z-10">{captcha}</span>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.08) 5px, rgba(0,0,0,0.08) 10px)' }} />
                </div>
                <button
                  type="button"
                  onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); setCaptchaError(''); }}
                  className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#0066cc] transition-all"
                  title="Refresh CAPTCHA"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter CAPTCHA above"
                value={captchaInput}
                onChange={(e) => { setCaptchaInput(e.target.value.toUpperCase()); setCaptchaError(''); }}
                maxLength={6}
                className={`w-full pl-4 pr-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border rounded-[14px] font-mono tracking-widest text-center text-[15px] uppercase outline-none focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:ring-4 transition-all duration-300 ${captchaError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-transparent focus:border-[#0066cc]/40 focus:ring-[#0066cc]/10'}`}
              />
              {captchaError && (
                <p className="text-[13px] text-red-500 flex items-center gap-1 mt-1 pl-1">
                  <AlertCircle size={14} /> {captchaError}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || !isFormValid()}
              className={`w-full mt-4 backdrop-blur-md font-medium text-[15px] py-4 rounded-[14px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center justify-center gap-2 group border border-transparent ${submitting || !isFormValid() ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-[#1d1d1f]/90 dark:bg-[#0066cc]/90 text-white hover:bg-[#0066cc]/90 hover:backdrop-blur-xl hover:shadow-[0_12px_40px_rgba(0,102,204,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-[0.98] hover:border-white/20'}`}
            >
              <Lock size={18} className="group-hover:-translate-y-0.5 transition-transform" />
              <span>{submitting ? "Please wait..." : (activeTab === "signup" ? "Create Account" : "Sign In")}</span>
              <ChevronRight size={18} className="opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all ml-1" />
            </button>
          </form>
        </div>
      </RevealOnScroll>
    </div>
  );
};

export default LoginPage;
