import { FileText, Clock, CheckCircle, ChevronRight, ThumbsUp, ThumbsDown, Loader2, CheckCheck, RefreshCw } from "lucide-react";
import { useState } from "react";
import CaseDetailsModal from "./CaseDetailsModal";
import RevealOnScroll from "../RevealOnScroll";

const UserDashboard = ({ t, complaints: globalComplaints, currentUser, patchComplaint, showAssignSuccess, refreshComplaints }) => {
  const [viewComplaint, setViewComplaint] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  // Use global complaints from parent - already filtered by phone
  const complaints = globalComplaints || [];

  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter(
    (c) => c.status === "pending"
  ).length;

  const verifiedCount = complaints.filter(
    (c) => c.status === "verified"
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  const handleResolution = async (complaint, resolutionStatus) => {
    if (!patchComplaint) return;
    setResolvingId(complaint.id + '-' + resolutionStatus);
    try {
      const label = resolutionStatus === 'resolved' ? 'Resolved' : 'Unresolved (sent back to admin)';
      await patchComplaint(complaint.id, {
        resolutionStatus,
        historyEntry: {
          action: resolutionStatus === 'resolved' ? 'Resolved' : 'Unresolved',
          by: 'User',
          to: resolutionStatus === 'unresolved' ? 'Admin' : null,
          timestamp: new Date().toISOString()
        }
      });
      if (showAssignSuccess) showAssignSuccess(`Case #${complaint.id} — ${label}`);
    } catch (e) {
      console.error('Resolution failed:', e);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
          {t.userDashboard}
        </h3>
      </div>

      {/* Stats Cards */}
      <RevealOnScroll delay={40}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-2">

          <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                {t.complaints}
              </h4>
              <div className="p-2 bg-blue-50 rounded-full">
                <FileText size={18} className="text-[#0066cc]" />
              </div>
            </div>
            <p className="text-4xl font-semibold tracking-tight text-[#0066cc]">
              {totalComplaints}
            </p>
          </div>

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
              {pendingCount}
            </p>
          </div>

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
              {verifiedCount}
            </p>
          </div>

          <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                Resolved
              </h4>
              <div className="p-2 bg-purple-50 rounded-full">
                <CheckCheck size={18} className="text-purple-600" />
              </div>
            </div>
            <p className="text-4xl font-semibold tracking-tight text-purple-600">
              {resolvedCount}
            </p>
          </div>

        </div>
      </RevealOnScroll>

      {/* Complaint Table */}
      <RevealOnScroll delay={100}>
        <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10/50 dark:border-white/10 flex items-center justify-between">
            <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              {t.complaints}
            </h4>
            <button
              onClick={refreshComplaints}
              className="flex items-center gap-2 bg-[#f5f5f7] dark:bg-[#2a2f42] hover:bg-gray-200 dark:hover:bg-[#363d54] text-[#1d1d1f] dark:text-white px-4 py-2 rounded-3xl transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={32} className="text-gray-300 mx-auto mb-4" />
              <p className="text-[#1d1d1f] dark:text-white font-medium text-[15px]">No complaints filed yet.</p>
              <p className="text-[#86868b] dark:text-[#a1a1a6] text-[14px] mt-1">When you file a report, it will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f5f7]/50 dark:bg-[#1c1c1e]/50">
                    <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                      {t.caseId}
                    </th>
                    <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                      {t.fileDate}
                    </th>
                    <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                      {t.type}
                    </th>
                    <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                      {t.status}
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
                      className="border-b border-gray-50/50 dark:border-white/5 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 transition-colors group"
                    >
                      <td className="px-6 py-4 text-[15px] font-medium text-[#1d1d1f] dark:text-white whitespace-nowrap">
                        {complaint.id}
                      </td>

                      <td className="px-6 py-4 text-[14px] text-[#86868b] dark:text-[#a1a1a6] whitespace-nowrap">
                        {complaint.date}
                      </td>

                      <td className="px-6 py-4 text-[14px] text-[#1d1d1f] dark:text-white whitespace-nowrap">
                        {complaint.type}
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewComplaint(complaint)}
                            className="flex items-center gap-1 text-[14px] font-medium text-[#0066cc] hover:text-[#004499] transition-colors"
                          >
                            <span>{t.view}</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                          {/* Resolution buttons - only shown when case is assigned and verified */}
                          {complaint.assignedTo && complaint.status === 'verified' && patchComplaint && (
                            <>
                              <button
                                onClick={() => handleResolution(complaint, 'resolved')}
                                disabled={!!resolvingId}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {resolvingId === complaint.id + '-resolved' ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <ThumbsUp size={13} />
                                )}
                                Resolved
                              </button>
                              <button
                                onClick={() => handleResolution(complaint, 'unresolved')}
                                disabled={!!resolvingId}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {resolvingId === complaint.id + '-unresolved' ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <ThumbsDown size={13} />
                                )}
                                Not Resolved
                              </button>
                            </>
                          )}
                          {complaint.status === 'resolved' && (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">
                              <CheckCheck size={13} /> Case Closed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </RevealOnScroll>

      {viewComplaint && (
        <CaseDetailsModal
          complaint={viewComplaint}
          onClose={() => setViewComplaint(null)}
          users={[currentUser]}
        />
      )}
    </div>
  );
};

export default UserDashboard;
