import { Scale, ChevronRight, Check, X, RefreshCw } from "lucide-react";
import { useState } from "react";
import CaseDetailsModal from "./CaseDetailsModal";
import RevealOnScroll from "../RevealOnScroll";

const LawyerDashboard = ({
  t,
  complaints,
  patchComplaint,
  showAssignSuccess,
  refreshComplaints
}) => {
  const [viewComplaint, setViewComplaint] = useState(null);

  const handleAssign = async (caseId, assignee) => {
    await patchComplaint(caseId, {
      assignedTo: assignee,
      historyEntry: {
        action: "Assigned",
        by: "Lawyer",
        to: assignee,
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleApprove = async (caseId) => {
    await patchComplaint(caseId, {
      status: "verified",
      historyEntry: {
        action: "Verified",
        by: "Lawyer",
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleReject = async (caseId) => {
    await patchComplaint(caseId, {
      status: "rejected",
      historyEntry: {
        action: "Rejected",
        by: "Lawyer",
        timestamp: new Date().toISOString()
      }
    });
  };

  // Show cases assigned to lawyer
  const assignedToLawyer = complaints.filter(
    (c) => c.assignedTo === "lawyer"
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 mb-2 px-1">
        <div className="p-2 bg-indigo-50/80 rounded-full border border-indigo-100">
          <Scale size={24} className="text-indigo-600" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
          {t.lawyerDashboard}
        </h3>
      </div>

      <RevealOnScroll delay={60}>
      {assignedToLawyer.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-2xl p-12 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex flex-col items-center justify-center text-center">
          <Scale size={32} className="text-gray-300 mb-4" />
          <p className="text-[#1d1d1f] font-medium text-[15px]">No cases assigned to you.</p>
          <p className="text-[#86868b] text-[14px] mt-1">Cases assigned by admin will appear here for your review.</p>
        </div>
      ) : (
        <div className="bg-white/40 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
          <div className="p-6 border-b border-gray-100/50 flex items-center justify-between">
            <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
              Your Assigned Cases
            </h4>
            <button
              onClick={refreshComplaints}
              className="flex items-center gap-2 bg-[#f5f5f7] hover:bg-gray-200 text-[#1d1d1f] px-4 py-2 rounded-3xl transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f5f7]/50">
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-gray-100">
                    {t.caseId}
                  </th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-gray-100">
                    {t.type}
                  </th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-gray-100">
                    {t.status}
                  </th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-gray-100">
                    Description
                  </th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] uppercase tracking-wider border-b border-gray-100">
                    {t.action}
                  </th>
                </tr>
              </thead>

              <tbody>
                {assignedToLawyer.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-gray-50/50 hover:bg-[#0066cc]/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-[15px] font-medium text-[#1d1d1f] whitespace-nowrap">
                      {complaint.id}
                    </td>

                    <td className="px-6 py-4 text-[14px] text-[#1d1d1f] whitespace-nowrap">
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

                    <td className="px-6 py-4 text-[14px] text-[#86868b] max-w-xs truncate">
                      {complaint.description}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewComplaint(complaint)}
                            className="flex items-center gap-1 text-[13px] font-medium text-[#0066cc] bg-[#0066cc]/10 hover:bg-[#0066cc]/20 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <span>{t.view}</span>
                            <ChevronRight size={14} />
                          </button>
                          
                          <select
                            onChange={async (e) => {
                              if (e.target.value) {
                                try {
                                  await handleAssign(complaint.id, e.target.value);
                                  showAssignSuccess(`Case ${complaint.id} assigned successfully!`);
                                } catch (err) {
                                  alert(err.message || "Could not assign case");
                                }
                                e.target.value = '';
                              }
                            }}
                            className="text-[13px] px-3 py-1.5 border border-gray-200 rounded-full text-[#1d1d1f] bg-white hover:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 transition-all cursor-pointer"
                          >
                            <option value="">{t.assignTo}</option>
                            <option value="counsellor">{t.counsellor}</option>
                          </select>
                        </div>

                        {complaint.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await handleApprove(complaint.id);
                                  showAssignSuccess(`Case ${complaint.id} approved successfully!`);
                                } catch (e) {
                                  alert(e.message || "Could not approve case");
                                }
                              }}
                              className="px-4 py-2 bg-[#e5f5ea] text-[#008f39] hover:bg-[#d1ebd9] active:scale-[0.98] transition-all rounded-full text-[13px] font-semibold flex items-center gap-1.5"
                            >
                              <Check size={14} />
                              {t.approve || "Approve"}
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  await handleReject(complaint.id);
                                  showAssignSuccess(`Case ${complaint.id} rejected successfully!`);
                                } catch (e) {
                                  alert(e.message || "Could not reject case");
                                }
                              }}
                              className="px-4 py-2 bg-[#ffe5e5] text-[#d93025] hover:bg-[#ffd1d1] active:scale-[0.98] transition-all rounded-full text-[13px] font-semibold flex items-center gap-1.5"
                            >
                              <X size={14} />
                              {t.reject || "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1 ml-1">Action completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </RevealOnScroll>

      {viewComplaint && (
        <CaseDetailsModal
          complaint={viewComplaint}
          onClose={() => setViewComplaint(null)}
        />
      )}
    </div>
  );
};

export default LawyerDashboard;
