import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, FileText, Shield, MessageCircle, AlertTriangle, Trash2 } from 'lucide-react';

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
};

const NotificationBell = ({ complaints, currentUser }) => {
  const userId = currentUser?.id || 'anonymous';
  const storageKey = `prashansa_notifications_${userId}`;
  const readKey = `prashansa_notifications_read_${userId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => loadFromStorage(storageKey, []));
  const [readIds, setReadIds] = useState(() => new Set(loadFromStorage(readKey, [])));
  const [deletedIds, setDeletedIds] = useState(() => new Set(loadFromStorage(`prashansa_notifications_deleted_${userId}`, [])));
  const prevComplaintsRef = useRef(null);
  const dropdownRef = useRef(null);
  const initialLoadRef = useRef(true);
  const prevUserIdRef = useRef(userId);

  // Reset notifications when user changes (login/logout/switch account)
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId;
      setNotifications(loadFromStorage(storageKey, []));
      setReadIds(new Set(loadFromStorage(readKey, [])));
      setDeletedIds(new Set(loadFromStorage(`prashansa_notifications_deleted_${userId}`, [])));
      prevComplaintsRef.current = null;
      initialLoadRef.current = true;
    }
  }, [userId, storageKey, readKey]);

  // Sync state across browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === storageKey) {
        setNotifications(loadFromStorage(storageKey, []));
      }
      if (e.key === readKey) {
        setReadIds(new Set(loadFromStorage(readKey, [])));
      }
      if (e.key === `prashansa_notifications_deleted_${userId}`) {
        setDeletedIds(new Set(loadFromStorage(`prashansa_notifications_deleted_${userId}`, [])));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey, readKey, userId]);

  // Persist notifications to localStorage (per-user)
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, storageKey]);

  // Persist read IDs to localStorage (per-user)
  useEffect(() => {
    localStorage.setItem(readKey, JSON.stringify([...readIds]));
  }, [readIds, readKey]);

  // Persist deleted IDs to localStorage (per-user)
  useEffect(() => {
    localStorage.setItem(`prashansa_notifications_deleted_${userId}`, JSON.stringify([...deletedIds]));
  }, [deletedIds, userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Diff complaints to generate notifications
  const generateNotifications = useCallback(() => {
    if (!complaints || !currentUser) return;
    const prev = prevComplaintsRef.current;

    // On first load, just store complaints without generating notifications
    // This prevents old/existing complaints from triggering notifications on login
    if (!prev || initialLoadRef.current) {
      prevComplaintsRef.current = complaints;
      initialLoadRef.current = false;
      return;
    }

    const prevMap = new Map(prev.map(c => [c.id, c]));
    const newNotifs = [];
    const now = new Date().toISOString();
    const role = currentUser.role;
    const phone = currentUser.phone;

    complaints.forEach(c => {
      const old = prevMap.get(c.id);
      let possibleNotifs = [];

      if (!old) {
        // New complaint appeared in this user's view
        if (role === 'admin' || c.reporterPhone === phone || c.assignedTo === role) {
          possibleNotifs.push({ id: `new-${c.id}`, type: 'new_case', message: `New case #${c.id} — ${c.type || 'Complaint'}`, time: now, icon: 'file' });
        }
      } else {
        // --- Assignment notification ---
        if (old.assignedTo !== c.assignedTo && c.assignedTo) {
          if (c.reporterPhone === phone) {
            possibleNotifs.push({ id: `assign-reporter-${c.id}-${c.assignedTo}`, type: 'assign', message: `Your case #${c.id} has been assigned to ${c.assignedTo}`, time: now, icon: 'shield' });
          }
          if (c.assignedTo === role) {
            possibleNotifs.push({ id: `assign-role-${c.id}-${c.assignedTo}`, type: 'assign', message: `Case #${c.id} has been assigned to you`, time: now, icon: 'shield' });
          }
          if (role === 'admin' && c.reporterPhone !== phone) {
            possibleNotifs.push({ id: `assign-admin-${c.id}-${c.assignedTo}`, type: 'assign', message: `Case #${c.id} assigned to ${c.assignedTo}`, time: now, icon: 'shield' });
          }
        }

        // --- Verification notification ---
        if (old.status !== c.status && c.status === 'verified') {
          if (c.reporterPhone === phone) {
            possibleNotifs.push({ id: `verified-user-${c.id}`, type: 'status', message: `Your case #${c.id} has been verified ✓`, time: now, icon: 'alert' });
          }
          if (role === 'admin') {
            possibleNotifs.push({ id: `verified-admin-${c.id}`, type: 'status', message: `Case #${c.id} has been verified`, time: now, icon: 'alert' });
          }
        }

        // --- Resolution notification ---
        if (old.status !== c.status && c.status === 'resolved') {
          if (role === 'admin') {
            possibleNotifs.push({ id: `resolved-admin-${c.id}`, type: 'status', message: `Case #${c.id} has been marked as Resolved`, time: now, icon: 'alert' });
          }
          if (c.assignedTo === role) {
            possibleNotifs.push({ id: `resolved-role-${c.id}`, type: 'status', message: `Case #${c.id} has been resolved by the reporter`, time: now, icon: 'alert' });
          }
        }

        // --- Unresolve notification ---
        if (old.assignedTo && !c.assignedTo && old.status !== 'pending' && c.status === 'pending') {
          if (role === 'admin') {
            possibleNotifs.push({ id: `unresolved-admin-${c.id}`, type: 'status', message: `Case #${c.id} marked Not Resolved — returned to queue`, time: now, icon: 'alert' });
          }
          if (old.assignedTo === role) {
            possibleNotifs.push({ id: `unresolved-role-${c.id}`, type: 'status', message: `Case #${c.id} has been marked Not Resolved by the reporter`, time: now, icon: 'alert' });
          }
        }

        // --- Generic status change fallback ---
        if (old.status !== c.status && c.status !== 'verified' && c.status !== 'resolved' && !(c.status === 'pending' && !c.assignedTo && old.assignedTo)) {
          if (role === 'admin' || c.reporterPhone === phone || c.assignedTo === role) {
            possibleNotifs.push({ id: `status-${c.id}-${c.status}`, type: 'status', message: `Case #${c.id} status → ${c.status}`, time: now, icon: 'alert' });
          }
        }
      }

      // Filter out notifications that were already marked as read or deleted, or already exist
      possibleNotifs.forEach(pn => {
        if (!deletedIds.has(pn.id) && !readIds.has(pn.id) && !notifications.some(n => n.id === pn.id)) {
          newNotifs.push(pn);
        }
      });
    });

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev].slice(0, 100));
    }
    prevComplaintsRef.current = complaints;
  }, [complaints, currentUser]);

  useEffect(() => { generateNotifications(); }, [generateNotifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const ids = notifications.map(n => n.id);
    setReadIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  };

  const markRead = (id) => {
    setReadIds(prev => new Set(prev).add(id));
  };

  const deleteNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    setReadIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDeletedIds(prev => new Set(prev).add(id));
  };

  const clearAllNotifications = () => {
    setDeletedIds(prev => {
      const next = new Set(prev);
      notifications.forEach(n => next.add(n.id));
      return next;
    });
    setNotifications([]);
    setReadIds(new Set());
  };

  const getIcon = (icon) => {
    switch (icon) {
      case 'file': return <FileText size={16} style={{ color: '#3b82f6' }} />;
      case 'shield': return <Shield size={16} style={{ color: '#8b5cf6' }} />;
      case 'chat': return <MessageCircle size={16} style={{ color: '#10b981' }} />;
      case 'alert': return <AlertTriangle size={16} style={{ color: '#f59e0b' }} />;
      default: return <Bell size={16} style={{ color: '#6b7280' }} />;
    }
  };

  const timeAgo = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative z-10" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#f5f5f7]/80 backdrop-blur-md border border-gray-200/50 shadow-sm hover:bg-white hover:shadow-md transition-all duration-300"
      >
        <Bell size={18} className="text-[#1d1d1f] dark:text-[#86868b]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#e60000] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(230,0,0,0.4)]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-14 w-[360px] bg-white/95 dark:bg-[#1e2333]/95 backdrop-blur-2xl rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white">Notifications</h4>
                {notifications.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#86868b] bg-[#f5f5f7] dark:bg-[#2a2f42] px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[12px] font-semibold text-[#0066cc] hover:text-[#004499] transition-colors flex items-center gap-1">
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                    <button
                      onClick={clearAllNotifications}
                      className="text-[12px] font-semibold text-[#e60000] hover:text-[#cc0000] transition-colors flex items-center gap-1"
                      title="Clear all notifications"
                    >
                      <Trash2 size={13} /> Clear
                    </button>
                  </>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X size={16} className="text-[#86868b]" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-[#f5f5f7] dark:bg-[#2a2f42] rounded-full flex items-center justify-center mb-3">
                    <Bell size={20} className="text-[#86868b]" />
                  </div>
                  <p className="text-[14px] font-medium text-[#86868b]">No notifications yet</p>
                  <p className="text-[12px] text-[#a1a1a6] mt-1">Updates will appear here</p>
                </div>
              ) : (
                notifications.map(n => {
                  const isRead = readIds.has(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`group/notif w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-[#f5f5f7]/60 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0 cursor-pointer ${!isRead ? 'bg-[#0066cc]/[0.03] dark:bg-[#0066cc]/5' : ''}`}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${!isRead ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-gray-50 dark:bg-white/5'}`}>
                        {getIcon(n.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${!isRead ? 'font-semibold text-[#1d1d1f] dark:text-white' : 'font-medium text-[#86868b] dark:text-[#a1a1a6]'}`}>
                          {n.message}
                        </p>
                        <p className="text-[11px] text-[#a1a1a6] mt-1">{timeAgo(n.time)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        {!isRead && <div className="w-2 h-2 rounded-full bg-[#0066cc]" />}
                        <button
                          onClick={(e) => deleteNotification(e, n.id)}
                          className="p-1 rounded-full opacity-0 group-hover/notif:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                          title="Delete notification"
                        >
                          <X size={13} className="text-[#a1a1a6] hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
