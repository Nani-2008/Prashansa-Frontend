import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MapPin, FileText, User, MessageCircle, LogOut, PlusCircle, Shield, Sun, Moon, BarChart3, Settings } from 'lucide-react';

const Sidebar = ({
  t,
  currentPage,
  setCurrentPage,
  handleLogout,
  userRole,
  currentUser,
  theme,
  toggleTheme
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Tabs without logout (logout is handled separately at the bottom)
  const getTabs = () => {
    if (userRole === 'admin') {
      return [
        { label: 'Analytics', value: "dashboard", icon: LayoutDashboard, color: "text-[#0066cc]" },
        { label: 'User Activity', value: "activity", icon: BarChart3, color: "text-[#8b5cf6]" },
        { label: 'Track', value: "track", icon: MapPin, color: "text-[#f59e0b]" },
        { label: 'Chat', value: "adminchat", icon: MessageCircle, color: "text-[#10b981]" },
        { label: 'Settings', value: "settings", icon: Settings, color: "text-[#64748b]" }
      ];
    }

    if (userRole === 'police' || userRole === 'lawyer' || userRole === 'counsellor') {
      return [
        { label: t.dashboard, value: "dashboard", icon: LayoutDashboard, color: "text-[#0066cc]" },
        { label: 'Performance', value: "performance", icon: BarChart3, color: "text-[#8b5cf6]" },
        ...(userRole === "lawyer" || userRole === "counsellor"
          ? [{ label: t.chat || "Chat", value: "chat", icon: MessageCircle, color: "text-[#10b981]" }]
          : []),
        { label: 'Admin Chat', value: "officialchat", icon: Shield, color: "text-[#f59e0b]" },
        { label: 'Settings', value: "settings", icon: Settings, color: "text-[#64748b]" }
      ];
    }

    // Regular user - victim/witness
    return [
      { label: t.dashboard, value: "dashboard", icon: LayoutDashboard, color: "text-[#0066cc]" },
      { label: t.registerComplaint, value: "complaint", icon: PlusCircle, color: "text-[#10b981]" },
      { label: t.track, value: "track", icon: MapPin, color: "text-[#f59e0b]" },
      { label: t.chat || "Chat", value: "chat", icon: MessageCircle, color: "text-[#8b5cf6]" },
      { label: 'Settings', value: "settings", icon: Settings, color: "text-[#64748b]" }
    ];
  };

  const tabs = getTabs();

  return (
    <aside className="w-72 my-6 ml-6 h-[calc(100vh-3rem)] bg-white dark:bg-[#1b1e2b] text-[#1d1d1f] dark:text-white flex flex-col pt-6 pb-8 px-6 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[20px_30px_60px_rgba(0,0,0,0.4),inset_2px_2px_4px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] z-20 overflow-hidden relative transition-colors duration-300">

      {/* User Profile Section (Top) */}
      {currentUser && (
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f7] dark:bg-[#363d54] flex items-center justify-center flex-shrink-0 text-[#1d1d1f] dark:text-white shadow-sm dark:shadow-[0_4px_10px_rgba(0,0,0,0.2)] border border-gray-200 dark:border-white/10 transition-colors overflow-hidden">
            {currentUser.profilePicUrl ? (
              <img src={currentUser.profilePicUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <span className="text-[16px] font-bold uppercase">
                {currentUser.name ? currentUser.name.charAt(0) : currentUser.phone ? currentUser.phone.charAt(0) : 'U'}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] text-[#86868b] dark:text-[#64748b] tracking-widest uppercase font-bold mb-0.5 transition-colors">
              {currentUser.role || 'User'} PORTAL
            </div>
            <div className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white truncate transition-colors">
              {currentUser.name || currentUser.phone || 'Welcome'}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col">
        <div className="text-[11px] font-bold text-[#86868b] dark:text-[#64748b] uppercase tracking-widest mb-4 ml-2 transition-colors">
          Menu
        </div>
        <nav className="flex flex-col gap-2 relative">
          {tabs.map((tab) => {
            const isActive = currentPage === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setCurrentPage(tab.value)}
                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-300 w-full text-left
                  ${isActive
                    ? "text-[#1d1d1f] dark:text-white bg-[#f5f5f7] dark:bg-[#2a2f42] shadow-sm dark:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.2)]"
                    : "text-[#86868b] dark:text-[#94a3b8] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2a2f42]/50"
                  }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isActive ? 'bg-white dark:bg-[#363d54] shadow-sm' : ''}`}>
                  <tab.icon size={18} className={tab.color} />
                </div>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        {/* Theme Toggle */}
        <div className="bg-[#f5f5f7] dark:bg-[#2a2f42] rounded-3xl p-1 flex relative w-full transition-colors">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-[#363d54] rounded-full shadow-sm transition-transform duration-300 ${
              theme === 'dark' ? 'translate-x-[100%]' : 'translate-x-0'
            }`}
          />
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full z-10 text-[13px] font-bold transition-colors ${
              theme === 'light' ? 'text-[#1d1d1f]' : 'text-[#86868b] dark:text-[#94a3b8]'
            }`}
          >
            <Sun size={14} /> Light
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full z-10 text-[13px] font-bold transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-[#86868b]'
            }`}
          >
            <Moon size={14} /> Dark
          </button>
        </div>

        {/* Bottom Button (Sign Out) */}
        <div className="bg-[#f5f5f7] dark:bg-[#2a2f42] rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.1)] text-center transition-colors">
          <p className="text-[12px] text-[#86868b] dark:text-[#94a3b8] mb-4 font-medium leading-relaxed transition-colors">
            Securely sign out of your account to protect your privacy.
          </p>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-[18px] text-[15px] font-bold text-white bg-[#e60000] shadow-[0_8px_20px_rgba(230,0,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.2)] hover:bg-[#cc0000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#1d1d1f]/40 backdrop-blur-md z-[100] px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1b1e2b] rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_1px_1px_2px_rgba(255,255,255,0.1)] w-full max-w-sm text-center border border-gray-100 dark:border-white/10 transition-colors"
            >
              <h3 className="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight mb-2">Sign Out</h3>
              <p className="text-[15px] text-[#86868b] dark:text-[#94a3b8] mb-8 leading-relaxed">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                  }}
                  className="w-full py-4 rounded-[20px] bg-[#e60000] text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(230,0,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.2)] hover:bg-[#cc0000] active:scale-[0.98] transition-all"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-4 rounded-[20px] bg-[#f5f5f7] dark:bg-[#2a2f42] text-[#1d1d1f] dark:text-white font-bold text-[15px] hover:bg-gray-200 dark:hover:bg-[#363d54] active:scale-[0.98] dark:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05)] transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;

