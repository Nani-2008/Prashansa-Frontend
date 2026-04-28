import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  AlertCircle, Edit3, Shield, HeartHandshake, Map, CheckCircle2,
  Globe, Zap, Users, Camera, ChevronRight, Clock, Scale,
  User,
  UserCheck,
  Award,
  LogIn
} from "lucide-react";
import { fetchStats } from "../../api/client";

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
  const springValue = useSpring(0, { bounce: 0, duration: 2000 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return <span>{displayValue}</span>;
};

const HomePage = ({ t, setCurrentPage, isLoggedIn }) => {
  const [stats, setStats] = useState({ complaints: 0, experts: 0 });

  useEffect(() => {
    fetchStats()
      .then(data => setStats(data))
      .catch(err => console.error("Failed to load stats:", err));
  }, []);

  // For smooth parallax fading
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const yParallax1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yParallax2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Right Side Feature Pills mapped from original Action Cards
  const actionCards = [
    { id: 1, title: t.registerComplaint, icon: <Edit3 size={20} className="text-[var(--color-primary)]" />, delay: 0.2, pos: "top-[15%] -left-12" },
    { id: 2, title: t.legalSupport, icon: <Shield size={20} className="text-[var(--color-primary)]" />, delay: 0.4, pos: "top-[40%] -right-16" },
    { id: 3, title: t.counselling, icon: <HeartHandshake size={20} className="text-[var(--color-primary)]" />, delay: 0.6, pos: "bottom-[25%] -left-8" },
    { id: 4, title: t.trackComplaint, icon: <Map size={20} className="text-[var(--color-primary)]" />, delay: 0.8, pos: "bottom-[5%] -right-4" }
  ];

  // Mapped from original Features section
  const featuresList = [
    { icon: <CheckCircle2 size={28} className="text-[var(--color-primary)]" />, title: t.secure, desc: t.secureDesc },
    { icon: <Zap size={28} className="text-[var(--color-primary)]" />, title: t.easyToUse, desc: t.easyDesc },
    { icon: <Globe size={28} className="text-[var(--color-primary)]" />, title: t.multiLang, desc: t.multiLangDesc },
    { icon: <Zap size={28} className="text-[var(--color-primary)]" />, title: t.quickResponse, desc: t.quickDesc },
    { icon: <Users size={28} className="text-[var(--color-primary)]" />, title: t.genderNeutral, desc: t.genderDesc },
    { icon: <Camera size={28} className="text-[var(--color-primary)]" />, title: t.videoEvidence, desc: t.videoDesc }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans w-full"
      style={{
        background: 'linear-gradient(145deg, #fbfbfd 0%, #f5f5f7 40%, #ffffff 70%, #fbfbfd 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 20s ease infinite'
      }}>

      {/* Background Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div style={{ y: yParallax1 }} className="absolute inset-0">
          <motion.div
            style={{ opacity }}
            animate={{
              y: [0, -30, 0, 30, 0],
              x: [0, 30, 0, -30, 0],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"
          />
        </motion.div>
        <motion.div style={{ y: yParallax2 }} className="absolute inset-0">
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"
          ></div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full z-10">
        {/* Hero Section */}
        <section className="mt-8 pt-24 pb-16 px-6 lg:px-16 w-full max-w-7xl mx-auto flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

            {/* Left Content Area */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start text-left max-w-2xl mt-8 lg:mt-0"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-[#1d1d1f] dark:text-white text-sm font-medium mb-6 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                Secure & Confidential Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1d1d1f] dark:text-white tracking-tight leading-[1.05] mb-4"
              >
                {t.heroTitle}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed mb-10 max-w-lg font-medium"
              >
                {t.heroText}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <button
                  onClick={() => setCurrentPage(isLoggedIn ? 'complaint' : 'signup')}
                  className="group relative overflow-hidden rounded-full px-8 py-4 text-base font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_6px_20px_rgba(26,111,196,0.2)] hover:shadow-[0_10px_30px_rgba(26,111,196,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-2">{t.getStarted} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
                </button>
                <button
                  onClick={() => setCurrentPage('login')}
                  className="rounded-full px-8 py-4 text-base font-semibold bg-white/70 backdrop-blur-md text-[var(--color-text-primary)] border border-white/50 shadow-sm hover:bg-white dark:bg-[#1c1c1e] hover:border-white hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <LogIn size={18} /> {t.SignIn}
                </button>
              </motion.div>

              {/* Trust Stats - Glass Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="mt-10 w-full max-w-2xl"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 glass-card !rounded-2xl !p-6 md:!p-8 transition-all duration-500">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-3 border border-[rgba(26,111,196,0.12)] shadow-sm">
                      <Users size={20} />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-baseline mb-1">
                      <AnimatedCounter value={stats.complaints} />+
                    </div>
                    <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest text-center">Users</div>
                  </div>

                  <div className="hidden sm:block w-px h-[70%] bg-slate-300/60 mx-auto my-auto"></div>

                  <motion.div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-3 border border-[rgba(0,102,204,0.12)] shadow-sm">
                      <Award size={22} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-baseline mb-1">
                      <AnimatedCounter value={stats.experts} />+
                    </div>
                    <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest text-center">Experts</div>
                  </motion.div>

                  <div className="hidden sm:block w-px h-[70%] bg-slate-300/60 mx-auto my-auto"></div>

                  <motion.div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-3 border border-[rgba(26,111,196,0.12)] shadow-sm">
                      <Clock size={20} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-baseline mb-1">
                      24/7
                    </div>
                    <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest text-center">Support</div>
                  </motion.div>

                  <div className="hidden sm:block w-px h-[70%] bg-slate-300/60 mx-auto my-auto"></div>

                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative h-[400px] md:h-[500px] w-full hidden lg:flex items-center justify-center perspective-1000"
            >
              <div className="relative w-full h-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-300/20 rounded-[40px] blur-xl transform group-hover:scale-105 transition-transform duration-700"></div>
                <motion.div
                  animate={{ y: [-15, 15, -15], rotateZ: [-1, 1, -1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-[40px] border border-white/60 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] max-sm:backdrop-blur-xl sm:backdrop-blur-3xl overflow-hidden flex items-center justify-center"
                >
                  {/* Central decor */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/40 dark:bg-[#1e2333]/70 rounded-full blur-3xl mix-blend-overlay" />
                  <Scale size={120} className="text-[#0066cc]/20" strokeWidth={1} />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-100/30 to-transparent" />
                </motion.div>

                {/* Floating Feature Pills based on Actions */}
                {actionCards.map((feature, idx) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: 50, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.8 + feature.delay, duration: 0.6 }}
                    className={`absolute ${feature.pos} z-10`}
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: feature.delay }}
                      className="flex items-center gap-4 bg-white/80 backdrop-blur-2xl px-6 py-4 rounded-full shadow-xl border border-gray-100 dark:border-white/10 transition-transform pointer-events-none"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#f5f5f7] dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] dark:text-white tracking-tight text-sm">{feature.title}</div>
                        <div className="text-[10px] font-semibold text-[#86868b] dark:text-[#a1a1a6] mt-0.5 uppercase tracking-wider">Quick Action</div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 lg:px-24 w-full max-w-7xl mx-auto py-24 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mb-16 md:mb-24"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)] mb-6 font-sans">
              {t.features}
            </h2>
            <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed font-medium">
              {t.heroSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {featuresList.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="flex flex-col items-start p-8 rounded-2xl glass-card hover:glass-card-hover hover:-translate-y-1 transition-all duration-300 w-full cursor-default"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center mb-6 shadow-inner border border-[rgba(26,111,196,0.08)]">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">{item.title}</h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* False Reporting Warning */}
        <section className="w-full py-16 px-6 lg:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card !border-red-100 !bg-white/80 rounded-[24px] p-8 md:p-10 flex flex-col md:flex-row gap-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-[24px]" />
              <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={36} strokeWidth={2} />
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-2">
                  {t.falseReportingTitle}
                </h3>
                <p className="text-[15px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                  {t.falseReportingText}
                </p>
                <ul className="text-[15px] text-[var(--color-text-primary)] space-y-2.5 mb-6 list-none">
                  {[t.falseConseq1, t.falseConseq2, t.falseConseq3, t.falseConseq4, t.falseConseq5].map((conseq, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">•</span>
                      <span className="leading-snug">{conseq}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold text-[15px] text-[#1d1d1f] dark:text-white">
                  {t.falseReportingEnd}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
  );
};

export default HomePage;
