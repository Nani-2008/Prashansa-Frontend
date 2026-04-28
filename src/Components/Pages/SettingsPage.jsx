import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Phone, Shield, Save, Eye, EyeOff, AlertCircle, Check, Settings as SettingsIcon, KeyRound, Camera } from 'lucide-react';
import * as api from '../../api/client.js';

const SettingsPage = ({ t, currentUser, setCurrentUser }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    emergencyContact: currentUser?.emergencyContact || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [picUploading, setPicUploading] = useState(false);
  const fileInputRef = useRef(null);

  const showMsg = (setter, msg) => { setter(msg); setTimeout(() => setter(''), 4000); };

  const handleProfileSave = async () => {
    if (!profileData.name.trim()) { showMsg(setProfileError, 'Name is required'); return; }
    if (!profileData.phone || profileData.phone.replace(/\D/g, '').length !== 10) { showMsg(setProfileError, 'Valid 10-digit phone required'); return; }
    setProfileSaving(true);
    try {
      const updated = await api.updateProfile({ name: profileData.name, phone: profileData.phone, emergencyContact: profileData.emergencyContact });
      setCurrentUser(updated);
      showMsg(setProfileSuccess, 'Profile updated successfully!');
    } catch (e) { showMsg(setProfileError, e.message || 'Failed to update profile'); }
    finally { setProfileSaving(false); }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showMsg(setProfileError, 'Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { showMsg(setProfileError, 'Image must be under 5MB'); return; }
    setPicUploading(true);
    try {
      const updated = await api.uploadProfilePic(file);
      setCurrentUser(updated);
      showMsg(setProfileSuccess, 'Profile picture updated!');
    } catch (e) { showMsg(setProfileError, e.message || 'Failed to upload picture'); }
    finally { setPicUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) { showMsg(setPasswordError, 'Enter current password'); return; }
    if (!passwordData.newPassword) { showMsg(setPasswordError, 'Enter new password'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { showMsg(setPasswordError, 'Passwords do not match'); return; }
    setPasswordSaving(true);
    try {
      await api.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMsg(setPasswordSuccess, 'Password changed successfully!');
    } catch (e) { showMsg(setPasswordError, e.message || 'Failed to change password'); }
    finally { setPasswordSaving(false); }
  };

  const ic = "w-full pl-11 pr-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 transition-all duration-300 outline-none";
  const rc = "w-full pl-11 pr-4 py-3.5 bg-[#f0f0f2] dark:bg-[#0a0a0a] border border-transparent rounded-[14px] text-[15px] text-[#86868b] cursor-not-allowed";

  const Toast = ({ msg, type }) => (
    <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.3 }}
      className={`fixed top-6 right-6 z-[100] ${type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border px-6 py-4 rounded-full shadow-lg font-semibold flex items-center gap-3 backdrop-blur-md`}>
      <div className={`${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} p-1.5 rounded-full`}>
        {type === 'success' ? <Check size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
      </div>
      {msg}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-transparent py-12 px-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <AnimatePresence>
          {profileSuccess && <Toast msg={profileSuccess} type="success" />}
          {passwordSuccess && <Toast msg={passwordSuccess} type="success" />}
          {profileError && <Toast msg={profileError} type="error" />}
          {passwordError && <Toast msg={passwordError} type="error" />}
        </AnimatePresence>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-[#0066cc]/10 to-[#0066cc]/5 rounded-2xl border border-[#0066cc]/10">
            <SettingsIcon size={28} className="text-[#0066cc]" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">Settings</h1>
            <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1">Manage your account</p>
          </div>
        </div>

        <div className="flex gap-3 mb-2">
          {[['profile', User, 'Profile'], ['password', KeyRound, 'Change Password']].map(([key, Icon, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[14px] transition-all duration-300 ${activeTab === key ? 'bg-[#0066cc] text-white shadow-[0_4px_14px_rgba(0,102,204,0.3)]' : 'bg-[#f5f5f7] dark:bg-[#1e2333] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-8">
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100 dark:border-white/10">
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePicUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={picUploading}
                className="relative w-20 h-20 rounded-full group flex-shrink-0 cursor-pointer"
                title="Click to change profile picture"
              >
                {currentUser?.profilePicUrl ? (
                  <img src={currentUser.profilePicUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-[0_8px_20px_rgba(0,102,204,0.3)]" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066cc] to-[#004499] flex items-center justify-center text-white text-3xl font-bold shadow-[0_8px_20px_rgba(0,102,204,0.3)]">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {picUploading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={22} className="text-white" />
                  )}
                </div>
              </button>
              <div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white">{currentUser?.name || 'User'}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0066cc]/10 text-[#0066cc] mt-1">
                  {currentUser?.role || 'user'}
                </span>
                <p className="text-[12px] text-[#86868b] mt-1">Click photo to change</p>
              </div>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Full Name', icon: User, value: profileData.name, key: 'name', type: 'text', ph: 'Your full name' },
                { label: 'Phone Number', icon: Phone, value: profileData.phone, key: 'phone', type: 'tel', ph: '10-digit phone', max: 10 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">{f.label}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#0066cc] transition-colors"><f.icon size={18} /></div>
                    <input type={f.type} maxLength={f.max} value={f.value} onChange={e => { let v = f.type === 'tel' ? e.target.value.replace(/\D/g,'') : e.target.value; setProfileData({...profileData, [f.key]: v}); }} className={ic} placeholder={f.ph} />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">Role</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Shield size={18} className="text-[#86868b]" /></div>
                  <input type="text" value={(currentUser?.role||'user').charAt(0).toUpperCase()+(currentUser?.role||'user').slice(1)} readOnly className={rc} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">Emergency Contact No.</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#0066cc] transition-colors"><Phone size={18} /></div>
                  <input type="tel" maxLength="10" value={profileData.emergencyContact} onChange={e => setProfileData({...profileData, emergencyContact: e.target.value.replace(/\D/g,'')})} className={ic} placeholder="Emergency contact number" />
                </div>
              </div>
              <button onClick={handleProfileSave} disabled={profileSaving}
                className={`w-full mt-4 font-semibold text-[15px] py-4 rounded-[16px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center justify-center gap-2 ${profileSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0066cc] text-white hover:bg-[#004499] active:scale-[0.98]'}`}>
                <Save size={18} /> {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'password' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/10">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-full"><KeyRound size={20} className="text-amber-600" /></div>
              <div><h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">Change Password</h3><p className="text-[13px] text-[#86868b]">Update your account password</p></div>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Current Password', key: 'currentPassword', show: showCurrentPass, toggle: () => setShowCurrentPass(!showCurrentPass), ph: 'Enter current password' },
                { label: 'New Password', key: 'newPassword', show: showNewPass, toggle: () => setShowNewPass(!showNewPass), ph: 'Enter new password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">{f.label}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#0066cc] transition-colors"><Lock size={18} /></div>
                    <input type={f.show ? 'text' : 'password'} value={passwordData[f.key]} onChange={e => setPasswordData({...passwordData, [f.key]: e.target.value})} className={ic + ' pr-11'} placeholder={f.ph} />
                    <button type="button" onClick={f.toggle} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#86868b] hover:text-[#0066cc] transition-colors">
                      {f.show ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#0066cc] transition-colors"><Lock size={18} /></div>
                  <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className={`${ic} ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? '!border-red-300 focus:!border-red-400 focus:!ring-red-100' : ''}`} placeholder="Re-enter new password" />
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-[13px] text-red-500 flex items-center gap-1 mt-1 pl-1"><AlertCircle size={14} /> Passwords do not match</p>
                )}
              </div>
              <button onClick={handlePasswordChange} disabled={passwordSaving || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                className={`w-full mt-4 font-semibold text-[15px] py-4 rounded-[16px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center justify-center gap-2 ${passwordSaving || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0066cc] text-white hover:bg-[#004499] active:scale-[0.98]'}`}>
                <KeyRound size={18} /> {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
