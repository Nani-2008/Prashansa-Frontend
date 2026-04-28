import { Menu, X, Home, LayoutDashboard, MapPin, LogOut, FileText, User, Scale, HeartHandshake, PlusCircle, MessageCircle } from "lucide-react";
import { useRef, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({
  t,
  isLoggedIn,
  language,
  setLanguage,
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogout,
  userRole,
  currentUser
}) => {

  const getTabs = () => {
    if (!isLoggedIn) {
      return [
        { label: t.home, value: "home", icon: Home },
        { label: t.report, value: "login", icon: User }
      ];
    }
    
    if (userRole === 'admin') {
      return [
        { label: t.dashboard, value: "dashboard", icon: LayoutDashboard },
        { label: t.track, value: "track", icon: MapPin },
        { label: t.logout, value: "logout", icon: LogOut },
      ];
    }
    
    if (userRole === 'police' || userRole === 'lawyer' || userRole === 'counsellor') {
      return [
        { label: t.dashboard, value: "dashboard", icon: LayoutDashboard },
        ...(userRole === "lawyer" || userRole === "counsellor"
          ? [{ label: t.chat || "Chat", value: "chat", icon: MessageCircle }]
          : []),
        { label: t.logout, value: "logout", icon: LogOut },
      ];
    }
    
    // Regular user - victim/witness
    return [
      { label: t.dashboard, value: "dashboard", icon: LayoutDashboard },
      { label: t.registerComplaint, value: "complaint", icon: PlusCircle },
      { label: t.track, value: "track", icon: MapPin },
      { label: t.chat || "Chat", value: "chat", icon: MessageCircle },
      { label: t.logout, value: "logout", icon: LogOut },
    ];
  };

  const tabs = getTabs();

  const languages = [
    { code: "eng", label: "English", symbol: "E" },
    { code: "tel", label: "Telugu", symbol: "తె" },
    { code: "mal", label: "Malayalam", symbol: "മ" }
  ];

  /* ================= DESKTOP NAV ================= */

  const navContainerRef = useRef(null);
  const navButtonRefs = useRef({});
  const [navSliderStyle, setNavSliderStyle] = useState({});

  // Treat 'signup' the same as 'login' for header tab highlighting
  const activePage = currentPage === 'signup' ? 'login' : currentPage;

  useLayoutEffect(() => {
    const activeButton = navButtonRefs.current[activePage];
    if (activeButton && navContainerRef.current) {
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setNavSliderStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activePage, isLoggedIn, language]);

  /* ================= MOBILE NAV ================= */

  const navContainerRefMobile = useRef(null);
  const navButtonRefsMobile = useRef({});
  const [navSliderStyleMobile, setNavSliderStyleMobile] = useState({});

  useLayoutEffect(() => {
    if (!mobileMenuOpen) return;

    const activeButton = navButtonRefsMobile.current[activePage];
    if (activeButton && navContainerRefMobile.current) {
      const containerRect =
        navContainerRefMobile.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setNavSliderStyleMobile({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activePage, mobileMenuOpen, language]);

  /* ================= DESKTOP LANGUAGE ================= */

  const langContainerRef = useRef(null);
  const langButtonRefs = useRef({});
  const [langSliderStyle, setLangSliderStyle] = useState({});

  useLayoutEffect(() => {
    const activeButton = langButtonRefs.current[language];
    if (activeButton && langContainerRef.current) {
      const containerRect = langContainerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setLangSliderStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [language]);

  /* ================= MOBILE LANGUAGE ================= */

  const langContainerRefMobile = useRef(null);
  const langButtonRefsMobile = useRef({});
  const [langSliderStyleMobile, setLangSliderStyleMobile] = useState({});

  useLayoutEffect(() => {
    if (!mobileMenuOpen) return;

    const activeButton = langButtonRefsMobile.current[language];
    if (activeButton && langContainerRefMobile.current) {
      const containerRect =
        langContainerRefMobile.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setLangSliderStyleMobile({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [language, mobileMenuOpen]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <motion.header
        layout
        initial={false}
        animate={{
          borderRadius: mobileMenuOpen ? "24px" : "999px",
          paddingTop: mobileMenuOpen ? "16px" : "8px",
          paddingBottom: mobileMenuOpen ? "16px" : "8px",
          marginTop: mobileMenuOpen ? "12px" : "12px",
        }}
        transition={{
          type: "spring",
          stiffness: 90,
          damping: 18,
          mass: 0.8,
        }}
        className="
sticky top-3 left-0 mx-auto max-w-[95%] md:max-w-7xl w-full z-50
backdrop-blur-[20px]
bg-white/70
border border-[#1d1d1f]/5
shadow-[0_8px_30px_rgb(0,0,0,0.06)]
px-2
">
        <div className="mx-auto px-4 py-3 relative flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3 z-10 cursor-pointer" onClick={() => setCurrentPage("home")}>
            <img src="/Logo-1.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div className="sm:hidden md:block">
              <div className="text-xl font-bold text-[#1d1d1f] tracking-tight leading-tight">
                {t.appName}
              </div>
              <div className="text-[10px] text-[#86868b] tracking-wide uppercase font-semibold">
                {t.tagline}
              </div>
            </div>
            <div className="hidden sm:block md:hidden">
              <div className="text-lg font-bold text-[#1d1d1f] tracking-tight leading-tight">
                {t.appName}
              </div>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <div
              ref={navContainerRef}
              className="relative flex gap-1 p-1 rounded-full bg-[#f5f5f7]/80 backdrop-blur-md border border-gray-200/50"
            >
              <motion.div
                animate={navSliderStyle}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-1 bottom-1 rounded-full bg-white shadow-[0_2px_8px_rgb(0,0,0,0.08)]"
              />

              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  ref={(el) => (navButtonRefs.current[tab.value] = el)}
                  onClick={() => {
                    if (tab.value === "logout") setShowLogoutModal(true);
                    else setCurrentPage(tab.value);
                  }}
                  className={`
                      relative flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                      ${tab.value === "logout"
                      ? "text-red-500 hover:text-red-600 hover:bg-red-50/80 hover:backdrop-blur-xl hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                      : activePage === tab.value
                        ? "text-[#1d1d1f]"
                        : "text-[#86868b] hover:text-[#1d1d1f]"
                    }
                      `}
                >
                  <tab.icon size={16} strokeWidth={2} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* User Info Badge */}
            {isLoggedIn && currentUser && (
              <div className="hidden lg:flex items-center gap-2 ml-4 px-4 py-2 bg-[#0066cc]/10 rounded-full border border-[#0066cc]/20">
                <span className="text-xs font-medium text-[#0066cc]">
                  {currentUser.name || currentUser.phone}
                </span>
                <span className="text-xs px-2 py-0.5 bg-[#0066cc] text-white rounded-full capitalize">
                  {currentUser.role}
                </span>
              </div>
            )}
          </nav>

          {/* DESKTOP LANGUAGE */}
          <div className={`hidden md:flex ${!isLoggedIn ? 'ml-auto' : ''} z-10`}>
            <div
              ref={langContainerRef}
              className="relative flex gap-1 p-1 rounded-full bg-[#f5f5f7]/80 backdrop-blur-md border border-gray-200/50"
            >
              <motion.div
                animate={langSliderStyle}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="absolute top-1 bottom-1 rounded-full bg-white shadow-[0_2px_8px_rgb(0,0,0,0.08)]"
              />

              {languages.map((langObj) => (
                <button
                  key={langObj.code}
                  ref={(el) => (langButtonRefs.current[langObj.code] = el)}
                  onClick={() => setLanguage(langObj.code)}
                  className={`relative flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider transition-all duration-300
                  ${language === langObj.code ? "text-[#1d1d1f]" : "text-[#86868b] hover:text-[#1d1d1f]"}`}
                >
                  <span className="text-[14px] font-medium leading-none">{langObj.symbol}</span>
                  {langObj.code}
                </button>
              ))}
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#1d1d1f] p-2 hover:bg-[#f5f5f7] rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden flex flex-col gap-4 px-4 pb-4"
            >
              <div className="border-t border-gray-200/50 pt-4 mt-2"></div>

              {/* MOBILE NAV */}
              <div
                ref={navContainerRefMobile}
                className="relative flex flex-col w-full gap-2 p-2 rounded-[16px] bg-[#f5f5f7]/80 border border-gray-200/50"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      if (tab.value === "logout") setShowLogoutModal(true);
                      else setCurrentPage(tab.value);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative flex items-center justify-center gap-2 w-full text-center py-3 rounded-[12px] text-sm font-medium transition-all duration-300
                    ${tab.value === "logout"
                        ? "text-red-500 hover:bg-red-50/80 hover:text-red-600 hover:backdrop-blur-xl hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
                        : activePage === tab.value
                          ? "bg-white text-[#1d1d1f] shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
                          : "text-[#86868b] hover:text-[#1d1d1f]"
                      }`}
                  >
                    <tab.icon size={18} strokeWidth={2} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* MOBILE LANGUAGE */}
              <div
                ref={langContainerRefMobile}
                className="relative flex w-full gap-1 p-1 rounded-[16px] bg-[#f5f5f7]/80 border border-gray-200/50"
              >
                <motion.div
                  animate={langSliderStyleMobile}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute top-1 bottom-1 rounded-[12px] bg-white shadow-[0_2px_8px_rgb(0,0,0,0.08)]"
                />

                {languages.map((langObj) => (
                  <button
                    key={langObj.code}
                    ref={(el) =>
                      (langButtonRefsMobile.current[langObj.code] = el)
                    }
                    onClick={() => {
                      setLanguage(langObj.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative flex items-center justify-center gap-1.5 flex-1 text-center py-2 text-xs rounded-[12px] font-semibold uppercase tracking-wider transition-all duration-300
                    ${language === langObj.code ? "text-[#1d1d1f]" : "text-[#86868b] hover:text-[#1d1d1f]"}`}
                  >
                    <span className="text-[14px] font-medium leading-none">{langObj.symbol}</span>
                    {langObj.code}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1d1d1f]/20 backdrop-blur-sm z-[100] px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[24px] p-8 shadow-[0_20px_40px_rgb(0,0,0,0.1)] w-full max-w-sm text-center border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-2">Sign Out</h3>
            <p className="text-[15px] text-[#86868b] mb-8 leading-relaxed">
              Are you sure you want to sign out of your account?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                className="
                      w-full py-3.5 rounded-[14px] 
                      bg-red-500 text-white font-medium text-[15px]
                      shadow-[0_4px_14px_rgba(239,68,68,0.3)]
                      hover:bg-red-600
                      active:scale-[0.98]
                      transition-all duration-200
                      "
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3.5 rounded-[14px] bg-[#f5f5f7] text-[#1d1d1f] font-medium text-[15px] hover:bg-[#e8e8ed] active:scale-[0.98] transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Header;
