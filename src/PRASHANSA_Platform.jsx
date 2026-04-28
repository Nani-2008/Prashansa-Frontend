import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import Header from './Components/Header.jsx';
import LoginPage from './Components/Pages/LoginPage.jsx';
import HomePage from "./Components/Pages/HomePage.jsx";
import ComplaintPage from './Components/Pages/ComplaintPage.jsx';
import TrackPage from './Components/Pages/TrackPage.jsx';
import ChatPage from './Components/Pages/ChatPage.jsx';
import UserActivityPage from './Components/Pages/UserActivityPage.jsx';
import AdminChatPage from './Components/Pages/AdminChatPage.jsx';
import OfficialChatPage from './Components/Pages/OfficialChatPage.jsx';
import PerformancePage from './Components/Pages/PerformancePage.jsx';
import SettingsPage from './Components/Pages/SettingsPage.jsx';
import { translations } from './Data/translations.js';
import DashboardPage from './Components/Pages/DashboardPage.jsx';
import * as api from './api/client.js';
import Sidebar from './Components/Sidebar.jsx';
import LanguageBar from './Components/LanguageBar.jsx';
import NotificationBell from './Components/NotificationBell.jsx';
import AiChatBot from './Components/AiChatBot.jsx';

const PRASHANSA = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState('eng');
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('prashansa_current_page') || 'home');

  useEffect(() => {
    localStorage.setItem('prashansa_current_page', currentPage);
  }, [currentPage]);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [logoutSuccessMessage, setLogoutSuccessMessage] = useState('');
  const [complaintSuccessMessage, setComplaintSuccessMessage] = useState('');
  const [assignSuccessMessage, setAssignSuccessMessage] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    role: 'victim',
    location: '',
    incidentType: '',
    incidentDate: '',
    incidentTime: '',
    description: '',
    incidentLocation: '',
    videoFile: null,
    audioFile: null,
    reporterRole: 'victim'
  });
  const [caseId, setCaseId] = useState(null);
  const [chatCaseId, setChatCaseId] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [authReady, setAuthReady] = useState(false);

  const shouldShowAiBot = useMemo(() => {
    if (!currentUser || currentUser.role !== 'user') return false;
    if (!complaints || complaints.length === 0) return false;
    return complaints.some(c => 
      c.status !== 'resolved' && 
      (c.assignedTo === 'lawyer' || c.assignedTo === 'counsellor')
    );
  }, [complaints, currentUser]);

  const [locationAccess, setLocationAccess] = useState('checking');
  const [liveLocation, setLiveLocation] = useState(null);
  const liveLocationRef = useRef(null);
  const currentUserRef = useRef(null);
  const lastSyncTimeRef = useRef(0);

  useEffect(() => {
    if (!authReady) return;

    // If logged in as staff, turn off location detection and bypass the wall
    if (isLoggedIn && ['admin', 'police', 'lawyer', 'counsellor'].includes(userRole)) {
      setLocationAccess('granted');
      setLiveLocation(null);
      liveLocationRef.current = null;
      return;
    }

    if (!navigator.geolocation) {
      setLocationAccess('denied');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocationAccess('granted');
        const locString = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
        setLiveLocation(locString);
        liveLocationRef.current = locString;
        
        const now = Date.now();
        if (currentUserRef.current && (now - lastSyncTimeRef.current > 30000)) {
          lastSyncTimeRef.current = now;
          api.updateUserLocation(locString).catch(e => console.error('Failed to sync user location', e));
          api.updateLiveLocation(locString).catch(e => console.error('Failed to sync complaint location', e));
        }
      },
      (error) => {
        console.error("Location error:", error);
        setLocationAccess('denied');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [authReady, isLoggedIn, userRole]);

  // Force an immediate location sync right after login/registration
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    if (['admin', 'police', 'lawyer', 'counsellor'].includes(currentUser.role)) return;
    // Immediately sync location to user record on login
    const syncNow = async () => {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
          })
        );
        const locString = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        liveLocationRef.current = locString;
        lastSyncTimeRef.current = Date.now();
        await api.updateUserLocation(locString);
      } catch {
        // Location unavailable — the watch will handle future updates
      }
    };
    syncNow();
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (liveLocationRef.current && currentUserRef.current) {
        const fd = new FormData();
        fd.append('location', liveLocationRef.current);
        navigator.sendBeacon('/api/complaints/live-location', fd);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const refreshComplaints = useCallback(async () => {
    const data = await api.fetchComplaints();
    setComplaints(data);
  }, []);

  const refreshUsers = useCallback(async () => {
    const data = await api.fetchUsers();
    setUsers(data);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await api.getMe();
        if (user) {
          setIsLoggedIn(true);
          setUserRole(user.role);
          setCurrentUser(user);
          await refreshComplaints();
          if (user.role === 'admin') {
            await refreshUsers();
          }
          setCurrentPage(prev => ['home', 'login', 'signup'].includes(prev) ? 'dashboard' : prev);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
          setCurrentUser(null);
          setTheme('light');
          localStorage.setItem('theme', 'light');
        }
      } catch (e) {
        setIsLoggedIn(false);
        setUserRole(null);
        setCurrentUser(null);
        setTheme('light');
        localStorage.setItem('theme', 'light');
      } finally {
        setAuthReady(true);
      }
    };
    initAuth();
  }, [refreshComplaints, refreshUsers]);

  useEffect(() => {
    if (authReady && !isLoggedIn && ['track', 'legal', 'counsel', 'complaint', 'dashboard', 'chat', 'activity', 'adminchat', 'officialchat', 'performance', 'settings'].includes(currentPage)) {
      setCurrentPage('login');
    }
  }, [authReady, isLoggedIn, currentPage]);

  // Periodically refresh users list for admin to pick up live location updates
  useEffect(() => {
    if (!isLoggedIn || userRole !== 'admin') return;
    const interval = setInterval(() => {
      refreshUsers().catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, userRole, refreshUsers]);

  // Periodically refresh complaints for all users
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      refreshComplaints().catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [isLoggedIn, refreshComplaints]);

  const t = translations[language];

  const getFilteredComplaints = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return complaints;
    if (currentUser.role === 'police') return complaints.filter((c) => c.assignedTo === 'police');
    if (currentUser.role === 'lawyer') return complaints.filter((c) => c.assignedTo === 'lawyer');
    if (currentUser.role === 'counsellor') return complaints.filter((c) => c.assignedTo === 'counsellor');
    return complaints.filter((c) => c.reporterPhone === currentUser.phone);
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      let videoUrl = null;
      let audioUrl = null;
      if (formData.videoFile) {
        const uploaded = await api.uploadMedia(formData.videoFile);
        videoUrl = uploaded.url;
      }
      if (formData.audioFile) {
        const uploaded = await api.uploadMedia(formData.audioFile);
        audioUrl = uploaded.url;
      }
      const created = await api.createComplaint({
        type: formData.incidentType,
        description: formData.description,
        reporterPhone: currentUser?.phone || formData.phone,
        reporterRole: formData.reporterRole,
        location: liveLocation,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        videoUrl,
        audioUrl
      });
      setCaseId(created.id);
      await refreshComplaints();
      setComplaintSuccessMessage(`Successfully reported. Case ID: ${created.id}`);
      setTimeout(() => {
        setComplaintSuccessMessage('');
      }, 4000);
      setFormData({
        phone: '',
        role: 'victim',
        location: '',
        incidentType: '',
        incidentDate: '',
        incidentTime: '',
        description: '',
        incidentLocation: '',
        videoFile: null,
        audioFile: null,
        reporterRole: 'victim'
      });
      setCurrentPage('dashboard');
    } catch (err) {
      alert(err.message || 'Could not submit complaint');
    }
  };

  const handleLogin = async (userData) => {
    setCurrentUser(userData);
    setUserRole(userData.role);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    await refreshComplaints();
    if (userData.role === 'admin') {
      await refreshUsers();
    }

    // Immediately sync live location for regular users right after login/register
    if (!['admin', 'police', 'lawyer', 'counsellor'].includes(userData.role)) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        );
        const locString = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        await api.updateUserLocation(locString);
      } catch {
        // Location unavailable — will be synced later by watchPosition
      }
    }

    setLoginSuccessMessage('Successfully logged in!');
    setTimeout(() => {
      setLoginSuccessMessage('');
    }, 3000);
  };

  const handleGrantRole = async (userId, newRole) => {
    await api.patchUserRole(userId, newRole);
    await refreshUsers();
  };

  const handleAddUser = async (userData) => {
    await api.createUser({
      phone: userData.phone,
      name: userData.name,
      role: userData.role || 'user',
      location: userData.location || ''
    });
    await refreshUsers();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      // Clean up old shared notification keys (from before per-user scoping)
      localStorage.removeItem('prashansa_notifications');
      localStorage.removeItem('prashansa_notifications_read');
      setIsLoggedIn(false);
      setUserRole(null);
      setCurrentUser(null);
      setUsers([]);
      setComplaints([]);
      setCurrentPage('home');
      setTheme('light');
      localStorage.setItem('theme', 'light');
      setLogoutSuccessMessage('Successfully logged out');
      setTimeout(() => {
        setLogoutSuccessMessage('');
      }, 3000);
    }
  };

  const patchComplaint = async (id, patch) => {
    await api.patchComplaint(id, patch);
    await refreshComplaints();
  };

  const showAssignSuccess = (message) => {
    setAssignSuccessMessage(message);
    setTimeout(() => setAssignSuccessMessage(''), 3000);
  };

  const deleteComplaint = async (id) => {
    await api.deleteComplaint(id);
    await refreshComplaints();
  };

  const handleDeleteUser = async (userId) => {
    await api.deleteUser(userId);
    await refreshUsers();
  };

  const useDashboardLayout = isLoggedIn && currentPage !== 'home';

  if (locationAccess === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div>
      </div>
    );
  }

  if (locationAccess === 'denied') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#121212] p-6 text-center">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] dark:text-white mb-4">Location Access Required</h1>
        <p className="text-[#86868b] dark:text-[#a1a1a6] max-w-md text-lg font-medium">
          Prashansa requires live location tracking for your safety and to accurately file complaints. Please enable location permissions in your browser to continue.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-[#1d1d1f] dark:text-white font-sans selection:bg-[#0066cc]/20 transition-colors duration-300 ${useDashboardLayout ? 'flex bg-[#f4f7fb] dark:bg-[#0b0f19]' : 'bg-[#fbfbfd] dark:bg-[#0b0f19]'}`}>
      
      <AnimatePresence>
        {loginSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-[100] bg-green-50 text-green-700 border border-green-200 px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(34,197,94,0.15)] font-semibold flex items-center gap-3 backdrop-blur-md"
          >
            <div className="bg-green-100 p-1.5 rounded-full text-green-600">
              <Check size={18} strokeWidth={3} />
            </div>
            {loginSuccessMessage}
          </motion.div>
        )}
        {logoutSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-[100] bg-red-50 text-red-700 border border-red-200 px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(239,68,68,0.15)] font-semibold flex items-center gap-3 backdrop-blur-md"
          >
            <div className="bg-red-100 p-1.5 rounded-full text-red-600">
              <Check size={18} strokeWidth={3} />
            </div>
            {logoutSuccessMessage}
          </motion.div>
        )}
        {complaintSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-[100] bg-blue-50 text-blue-700 border border-blue-200 px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(0,102,204,0.15)] font-semibold flex items-center gap-3 backdrop-blur-md"
          >
            <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
              <Check size={18} strokeWidth={3} />
            </div>
            {complaintSuccessMessage}
          </motion.div>
        )}
        {assignSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-[100] bg-blue-50 text-blue-700 border border-blue-200 px-6 py-4 rounded-full shadow-[0_8px_30px_rgba(0,102,204,0.15)] font-semibold flex items-center gap-3 backdrop-blur-md"
          >
            <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
              <Check size={18} strokeWidth={3} />
            </div>
            {assignSuccessMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* conditionally render sidebar vs header */}
      {useDashboardLayout ? (
        <Sidebar
          t={t}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          userRole={userRole}
          currentUser={currentUser}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        <Header
          t={t}
          isLoggedIn={isLoggedIn}
          language={language}
          setLanguage={setLanguage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          handleLogout={handleLogout}
          userRole={userRole}
          complaints={complaints}
          currentUser={currentUser}
        />
      )}

      <div className={`${useDashboardLayout ? 'flex-1 flex flex-col h-screen overflow-y-auto relative' : 'w-full'}`}>
        {/* Language bar in dashboard layout */}
        {useDashboardLayout && (
          <div className="absolute top-6 right-8 z-50 flex items-center gap-3">
            <NotificationBell complaints={complaints} currentUser={currentUser} />
            <LanguageBar language={language} setLanguage={setLanguage} />
          </div>
        )}

        {/* Content Area */}
        <div className={useDashboardLayout ? "p-8 w-full max-w-[1600px] mx-auto mt-12 sm:mt-0" : "w-full"}>
          
          {authReady && currentPage === "home" && (
            <HomePage
              t={t}
              setCurrentPage={(page) => {
                if (!isLoggedIn && ['track', 'legal', 'counsel', 'complaint', 'chat'].includes(page)) {
                  setCurrentPage('login');
                  return;
                }
                setCurrentPage(page);
              }}
              isLoggedIn={isLoggedIn}
            />
          )}

          {authReady && currentPage === 'login' && (
            <LoginPage
              t={t}
              handleLogin={handleLogin}
              defaultTab="signin"
            />
          )}

          {authReady && currentPage === 'signup' && (
            <LoginPage
              t={t}
              handleLogin={handleLogin}
              defaultTab="signup"
            />
          )}

          {currentPage === "complaint" && isLoggedIn && (
            <ComplaintPage
              t={t}
              formData={formData}
              setFormData={setFormData}
              handleComplaintSubmit={handleComplaintSubmit}
              caseId={caseId}
            />
          )}

          {authReady && currentPage === "track" && isLoggedIn && (
            <TrackPage
              t={t}
              complaints={complaints}
              currentUser={currentUser}
            />
          )}

          {authReady && currentPage === "dashboard" && isLoggedIn && (
            <DashboardPage
              t={t}
              userRole={userRole}
              complaints={getFilteredComplaints()}
              allComplaints={complaints}
              patchComplaint={patchComplaint}
              deleteComplaint={deleteComplaint}
              currentUser={currentUser}
              users={users}
              handleGrantRole={handleGrantRole}
              handleAddUser={handleAddUser}
              handleDeleteUser={handleDeleteUser}
              setCurrentPage={setCurrentPage}
              setChatCaseId={setChatCaseId}
              showAssignSuccess={showAssignSuccess}
              refreshComplaints={refreshComplaints}
              refreshUsers={refreshUsers}
            />
          )}

          {authReady && currentPage === "chat" && isLoggedIn && (
            <ChatPage
              t={t}
              complaints={getFilteredComplaints()}
              currentUser={currentUser}
              initialCaseId={chatCaseId}
            />
          )}

          {authReady && currentPage === "activity" && isLoggedIn && userRole === 'admin' && (
            <UserActivityPage
              t={t}
              users={users}
              complaints={complaints}
            />
          )}

          {authReady && currentPage === "adminchat" && isLoggedIn && userRole === 'admin' && (
            <AdminChatPage
              t={t}
              currentUser={currentUser}
            />
          )}

          {authReady && currentPage === "officialchat" && isLoggedIn && ['police', 'lawyer', 'counsellor'].includes(userRole) && (
            <OfficialChatPage
              t={t}
              currentUser={currentUser}
            />
          )}

          {authReady && currentPage === "performance" && isLoggedIn && ['police', 'lawyer', 'counsellor'].includes(userRole) && (
            <PerformancePage
              t={t}
              complaints={complaints}
              currentUser={currentUser}
            />
          )}

          {authReady && currentPage === "settings" && isLoggedIn && (
            <SettingsPage
              t={t}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          )}

          {!authReady && (
            <div className="min-h-[40vh] flex items-center justify-center text-[#86868b]">Loading…</div>
          )}

          {!useDashboardLayout && (
            <footer className="bg-[#f5f5f7] border-t border-gray-200 text-[#86868b] py-8 px-4 mt-16">
              <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                <p className="font-semibold text-[#1d1d1f] mb-1"> {t.appName} </p>
                <p className="text-sm mb-4">{t.tagline}</p>
                <p className="text-xs">© 2026 {t.appName}. All rights reserved.</p>
              </div>
            </footer>
          )}

          {shouldShowAiBot && <AiChatBot />}
        </div>
      </div>
    </div>
  );
};

export default PRASHANSA;