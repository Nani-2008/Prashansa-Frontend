import { Users, FileText, CheckCircle, Clock, ChevronRight, Shield, Scale, Heart, UserPlus, Trash2, Edit, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CaseDetailsModal from "./CaseDetailsModal";
import RevealOnScroll from "../RevealOnScroll";

const AdminDashboard = ({ t, complaints, patchComplaint, deleteComplaint, users, handleGrantRole, handleAddUser, handleDeleteUser, currentUser, showAssignSuccess, refreshComplaints, refreshUsers }) => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ phone: '', name: '', role: 'user', location: '' });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('admin_dashboard_tab') || 'cases';
  });

  // Persist tab selection
  useEffect(() => {
    localStorage.setItem('admin_dashboard_tab', activeTab);
  }, [activeTab]);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [caseToDelete, setCaseToDelete] = useState(null);

  const handleAssign = async (caseId, assignee) => {
    try {
      await patchComplaint(caseId, {
        assignedTo: assignee,
        historyEntry: {
          action: "Assigned",
          by: "Admin",
          to: assignee,
          timestamp: new Date().toISOString()
        }
      });
      showAssignSuccess(`Case ${caseId} assigned to ${assignee} successfully!`);
    } catch (e) {
      alert(e.message || "Could not assign case");
    }
    setAssignModalOpen(false);
    setSelectedCase(null);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteComplaint(caseToDelete);
      showAssignSuccess(`Case ${caseToDelete} deleted successfully!`);
    } catch (e) {
      alert(e.message || "Could not delete case");
    } finally {
      setIsDeleting(false);
      setCaseToDelete(null);
    }
  };

  const handleAddNewUser = async () => {
    if (!newUser.phone || !newUser.name) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await handleAddUser(newUser);
      setNewUser({ phone: '', name: '', role: 'user', location: '' });
      setShowUserModal(false);
    } catch (e) {
      alert(e.message || "Could not add user");
    }
  };

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await handleDeleteUser(userToDelete);
      showAssignSuccess('User deleted successfully!');
    } catch (e) {
      alert(e.message || "Could not delete user");
    } finally {
      setIsDeletingUser(false);
      setUserToDelete(null);
    }
  };

  const totalCases = complaints.length;
  const verifiedCases = complaints.filter(
    (c) => c.status === "verified"
  ).length;

  const pendingCases = complaints.filter(
    (c) => c.status === "pending"
  ).length;

  const resolvedCases = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  const totalUsers = users?.length || 0;
  const policeCount = users?.filter(u => u.role === 'police').length || 0;
  const lawyerCount = users?.filter(u => u.role === 'lawyer').length || 0;
  const counsellorCount = users?.filter(u => u.role === 'counsellor').length || 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2 rounded-3xl font-medium transition-all ${activeTab === 'cases'
            ? 'bg-[#0066cc] text-white'
            : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
        >
          <span className="flex items-center gap-2">
            <FileText size={18} />
            {t.allComplaints || 'All Cases'}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-3xl font-medium transition-all ${activeTab === 'users'
            ? 'bg-[#0066cc] text-white'
            : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
        >
          <span className="flex items-center gap-2">
            <Users size={18} />
            {t.manageUsers || 'Manage Users'}
          </span>
        </button>
      </div>

      {activeTab === 'cases' && (
        <>
          <RevealOnScroll delay={40}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4">
              {/* Total Cases */}
              <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Total Cases
                  </h4>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <FileText size={18} className="text-[#0066cc]" />
                  </div>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-[#0066cc]">
                  {totalCases}
                </p>
              </div>

              {/* Verified */}
              <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    {t.verified}
                  </h4>
                  <div className="p-2 bg-green-50 rounded-full">
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-green-600">
                  {verifiedCases}
                </p>
              </div>

              {/* Pending */}
              <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    {t.pending}
                  </h4>
                  <div className="p-2 bg-yellow-50 rounded-full">
                    <Clock size={18} className="text-yellow-600" />
                  </div>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-yellow-600">
                  {pendingCases}
                </p>
              </div>

              {/* Resolved */}
              <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Resolved
                  </h4>
                  <div className="p-2 bg-purple-50 rounded-full">
                    <CheckCircle size={18} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-purple-600">
                  {resolvedCases}
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Cases Table with Assignment */}
          <RevealOnScroll delay={100}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 overflow-hidden mt-6">
              <div className="p-6 border-b border-gray-100 dark:border-white/10/50 dark:border-white/10 flex items-center justify-between">
                <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                  All Cases - Assignment Panel
                </h4>
                <button
                  onClick={refreshComplaints}
                  className="flex items-center gap-2 bg-[#f5f5f7] dark:bg-[#2a2f42] hover:bg-gray-200 dark:hover:bg-[#363d54] text-[#1d1d1f] dark:text-white px-4 py-2 rounded-3xl transition-colors"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f7]/50 dark:bg-[#1c1c1e]/50">
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        {t.caseId}
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        {t.type}
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        Reporter
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        {t.status}
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        {t.assignedTo}
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        {t.action}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {complaints.map((complaint) => (
                      <tr
                        key={complaint.id}
                        className="border-b border-gray-50/50 dark:border-white/5 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-[15px] font-medium text-[#1d1d1f] dark:text-white whitespace-nowrap">
                          {complaint.id}
                        </td>

                        <td className="px-6 py-4 text-[14px] text-[#1d1d1f] dark:text-white whitespace-nowrap">
                          {complaint.type}
                        </td>

                        <td className="px-6 py-4 text-[14px] text-[#1d1d1f] dark:text-white whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium">{complaint.reporterRole === 'victim' ? 'Victim' : 'Witness'}</span>
                            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">{complaint.reporterPhone || 'Anonymous'}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wide
                      ${complaint.status === "verified"
                                ? "bg-[#e5f5ea] text-[#008f39]"
                                : complaint.status === "rejected"
                                  ? "bg-[#ffe5e5] text-[#d93025]"
                                  : complaint.status === "resolved"
                                    ? "bg-[#f3e8ff] text-[#7c3aed]"
                                    : "bg-[#fff5e5] text-[#cc7000]"
                              }`}
                          >
                            {complaint.status === "verified"
                              ? t.verified
                              : complaint.status === "rejected"
                                ? "Rejected"
                                : complaint.status === "resolved"
                                  ? "Resolved"
                                  : t.pending}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wide ${complaint.assignedTo ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {complaint.assignedTo || t.unassigned}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-3">
                            <select
                              disabled={complaint.status === 'resolved'}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssign(complaint.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className={`text-[14px] px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-full bg-white dark:bg-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 transition-all ${complaint.status === 'resolved' ? 'text-[#a1a1a6] cursor-not-allowed opacity-50' : 'text-[#1d1d1f] dark:text-white hover:border-[#0066cc] cursor-pointer'}`}
                            >
                              <option value="">{complaint.status === 'resolved' ? 'Resolved' : t.assignTo}</option>
                              <option value="lawyer">{t.lawyer}</option>
                              <option value="police">{t.police}</option>
                            </select>
                            <button
                              onClick={() => setViewComplaint(complaint)}
                              className="flex items-center gap-1 text-[14px] font-medium text-[#0066cc] hover:text-[#004499] transition-colors"
                            >
                              <span>{t.view}</span>
                              <ChevronRight size={14} />
                            </button>
                            <button
                              onClick={() => setCaseToDelete(complaint.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                              title="Delete Case"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealOnScroll>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <RevealOnScroll delay={40}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4">
              {/* Total Users */}
              <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Total Users
                  </h4>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Users size={18} className="text-[#0066cc]" />
                  </div>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-[#0066cc]">
                  {totalUsers}
                </p>
              </div>

              {/* Police */}
              <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Police
                  </h4>
                  <div className="p-2 bg-green-50 rounded-full">
                    <Shield size={18} className="text-green-600" />
                  </div>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-green-600">
                  {policeCount}
                </p>
              </div>

              {/* Lawyers */}
              <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Lawyers
                  </h4>
                  <div className="p-2 bg-purple-50 rounded-full">
                    <Scale size={18} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-purple-600">
                  {lawyerCount}
                </p>
              </div>

              {/* Counsellors */}
              <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Counsellors
                  </h4>
                  <div className="p-2 bg-pink-50 rounded-full">
                    <Heart size={18} className="text-pink-600" />
                  </div>
                </div>
                <p className="text-4xl font-semibold tracking-tight text-pink-600">
                  {counsellorCount}
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Users Table */}
          <RevealOnScroll delay={100}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-white/10/50 dark:border-white/10 flex items-center justify-between">
                <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                  User Management
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshUsers}
                    className="flex items-center gap-2 bg-[#f5f5f7] dark:bg-[#2a2f42] hover:bg-gray-200 dark:hover:bg-[#363d54] text-[#1d1d1f] dark:text-white px-4 py-2 rounded-3xl transition-colors"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="flex items-center gap-2 bg-[#0066cc] text-white px-4 py-2 rounded-3xl hover:bg-[#004499] transition-colors"
                  >
                    <UserPlus size={18} />
                    Add User
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f7]/50 dark:bg-[#1c1c1e]/50">
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        Name
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        Role
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        Location
                      </th>
                      <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                        {t.action}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users?.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-50/50 dark:border-white/5 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-[15px] font-medium text-[#1d1d1f] dark:text-white">
                          {user.name}
                        </td>

                        <td className="px-6 py-4 text-[14px] text-[#1d1d1f] dark:text-white">
                          {user.phone}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={async (e) => {
                              try {
                                await handleGrantRole(user.id, e.target.value);
                              } catch (err) {
                                alert(err.message || "Could not update role");
                              }
                            }}
                            className="text-[14px] px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-[#1d1d1f] dark:text-white bg-white dark:bg-[#1c1c1e] hover:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 transition-all cursor-pointer"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="police">Police</option>
                            <option value="lawyer">Lawyer</option>
                            <option value="counsellor">Counsellor</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-[14px] text-[#1d1d1f] dark:text-white">
                          {user.location || '-'}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setUserToDelete(user.id)}
                            disabled={user.role === 'admin'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${user.role === 'admin' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.98]'}`}
                            title={user.role === 'admin' ? 'Cannot delete admin' : 'Delete User'}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealOnScroll>

          {/* Add User Modal */}
          {showUserModal && createPortal(
            <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-8 max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] min-h-0">
                <h3 className="text-2xl font-semibold mb-6 flex-none text-[#1d1d1f] dark:text-white">Add New User</h3>
                <div className="space-y-4 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
                  <div>
                    <label className="block text-sm font-medium text-[#86868b] dark:text-[#a1a1a6] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      maxLength="10"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-[12px] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 outline-none text-[#1d1d1f] dark:text-white bg-transparent"
                      placeholder="10-digit phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868b] dark:text-[#a1a1a6] mb-1">Name *</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-[12px] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 outline-none text-[#1d1d1f] dark:text-white bg-transparent"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868b] dark:text-[#a1a1a6] mb-1">Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-[12px] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 outline-none appearance-none text-[#1d1d1f] dark:text-white bg-white dark:bg-[#1c1c1e]"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="police">Police</option>
                      <option value="lawyer">Lawyer</option>
                      <option value="counsellor">Counsellor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#86868b] dark:text-[#a1a1a6] mb-1">Location</label>
                    <input
                      type="text"
                      value={newUser.location}
                      onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-[12px] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 outline-none text-[#1d1d1f] dark:text-white bg-transparent"
                      placeholder="Optional location"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex-none">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-sm font-medium text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewUser}
                    className="px-6 py-2 bg-[#0066cc] hover:bg-[#004499] text-white rounded-full text-sm font-semibold transition-colors shadow-[0_4px_10px_rgba(0,102,204,0.3)]"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        </>
      )}

      {viewComplaint && (
        <CaseDetailsModal
          complaint={viewComplaint}
          onClose={() => setViewComplaint(null)}
          users={users}
        />
      )}

      {/* Delete Case Confirmation Modal */}
      {caseToDelete && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-[#1d1d1f]/40 backdrop-blur-md z-[100] px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[#1b1e2b] rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_1px_1px_2px_rgba(255,255,255,0.1)] w-full max-w-sm text-center border border-gray-100 dark:border-white/10 transition-colors"
          >
            <h3 className="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight mb-2">Delete Case</h3>
            <p className="text-[15px] text-[#86868b] dark:text-[#94a3b8] mb-8 leading-relaxed">
              Are you sure you want to permanently delete this case? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteCase}
                disabled={isDeleting}
                className="w-full py-4 rounded-[20px] bg-[#e60000] text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(230,0,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.2)] hover:bg-[#cc0000] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
              <button
                onClick={() => setCaseToDelete(null)}
                disabled={isDeleting}
                className="w-full py-4 rounded-[20px] bg-[#f5f5f7] dark:bg-[#2a2f42] text-[#1d1d1f] dark:text-white font-bold text-[15px] hover:bg-gray-200 dark:hover:bg-[#363d54] active:scale-[0.98] dark:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-[#1d1d1f]/40 backdrop-blur-md z-[100] px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[#1b1e2b] rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_1px_1px_2px_rgba(255,255,255,0.1)] w-full max-w-sm text-center border border-gray-100 dark:border-white/10 transition-colors"
          >
            <h3 className="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight mb-2">Delete User</h3>
            <p className="text-[15px] text-[#86868b] dark:text-[#94a3b8] mb-8 leading-relaxed">
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDeleteUser}
                disabled={isDeletingUser}
                className="w-full py-4 rounded-[20px] bg-[#e60000] text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(230,0,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.2)] hover:bg-[#cc0000] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingUser ? "Deleting..." : "Delete Permanently"}
              </button>
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="w-full py-4 rounded-[20px] bg-[#f5f5f7] dark:bg-[#2a2f42] text-[#1d1d1f] dark:text-white font-bold text-[15px] hover:bg-gray-200 dark:hover:bg-[#363d54] active:scale-[0.98] dark:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminDashboard;
