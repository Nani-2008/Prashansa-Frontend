import { Check, X, ShieldAlert, ChevronRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import RevealOnScroll from "../RevealOnScroll";
import CaseDetailsModal from "./CaseDetailsModal";

const PoliceDashboard = ({
  t,
  complaints,
  patchComplaint = async () => {
    throw new Error("Complaint update function is missing.");
  },
  currentUser,
  showAssignSuccess,
  refreshComplaints
}) => {
  const [viewComplaint, setViewComplaint] = useState(null);
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

  const handleApprove = async (id) => {
    await patchComplaint(id, {
      status: "verified",
      historyEntry: {
        action: "Verified",
        by: "Police",
        to: null,
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleReject = async (id) => {
    await patchComplaint(id, {
      status: "rejected",
      historyEntry: {
        action: "Rejected - Insufficient Evidence",
        by: "Police",
        to: null,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Show cases that are pending OR assigned to police
  const policeCases = complaints.filter((c) => {
    if (c.status === "pending") return true;
    if (c.assignedTo === "police") return true;
    // Keep recently actioned cases visible so "Approve/Reject" feels responsive
    return (c.assignmentHistory || []).some((h) => h?.by === "Police");
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 mb-2 px-1">
        <div className="p-2 bg-blue-50/80 rounded-full border border-blue-100">
          <ShieldAlert size={24} className="text-[#0066cc]" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
          {t.policeDashboard}
        </h3>
      </div>

      <RevealOnScroll delay={60}>
        <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10/50 dark:border-white/10 flex items-center justify-between">
            <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              Cases Requiring Action
            </h4>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200/50 rounded-full text-[13px] font-semibold tracking-wide">
                {policeCases.length} Cases
              </span>
              <button
                onClick={refreshComplaints}
                className="flex items-center gap-2 bg-[#f5f5f7] dark:bg-[#2a2f42] hover:bg-gray-200 dark:hover:bg-[#363d54] text-[#1d1d1f] dark:text-white px-4 py-2 rounded-3xl transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
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
                    {t.status}
                  </th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                    Evidence
                  </th>
                  <th className="px-6 py-4 text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider border-b border-gray-100 dark:border-white/10">
                    {t.action}
                  </th>
                </tr>
              </thead>

              <tbody>
                {policeCases.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-12 h-12 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-full flex items-center justify-center mb-4">
                          <Check size={24} className="text-green-500" />
                        </div>
                        <p className="text-[#1d1d1f] dark:text-white font-medium text-[15px]">All caught up!</p>
                        <p className="text-[#86868b] dark:text-[#a1a1a6] text-[14px] mt-1">There are no cases requiring your review.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {policeCases.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-gray-50/50 dark:border-white/5 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 transition-colors group"
                  >
                    <td className="px-6 py-4 text-[15px] font-medium text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {complaint.id}
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
                      {complaint.videoUrl ? (
                        <button
                          onClick={() => setPlayingVideoUrl(complaint.videoUrl)}
                          className="text-[#0066cc] text-[13px] font-semibold hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <ShieldAlert size={14} />
                          View Video
                        </button>
                      ) : (
                        <span className="text-[#86868b] dark:text-[#a1a1a6] text-[13px] font-semibold px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-full">No video</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewComplaint(complaint)}
                            className="flex items-center gap-1 text-[14px] font-medium text-[#0066cc] hover:text-[#004499] transition-colors"
                          >
                            <span>{t.view}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>

                        {complaint.status === "pending" ? (
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={async () => {
                                try {
                                  await handleApprove(complaint.id);
                                  if (showAssignSuccess) showAssignSuccess(`Case ${complaint.id} verified successfully!`);
                                } catch (e) {
                                  if (showAssignSuccess) showAssignSuccess(`Error: ${e.message || 'Could not approve complaint'}`);
                                }
                              }}
                              className="px-4 py-2 bg-[#e5f5ea] text-[#008f39] hover:bg-[#d1ebd9] active:scale-[0.98] transition-all rounded-3xl text-[13px] font-semibold flex items-center gap-1.5"
                            >
                              <Check size={14} />
                              {t.approve}
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  await handleReject(complaint.id);
                                  if (showAssignSuccess) showAssignSuccess(`Case ${complaint.id} rejected successfully!`);
                                } catch (e) {
                                  if (showAssignSuccess) showAssignSuccess(`Error: ${e.message || 'Could not reject complaint'}`);
                                }
                              }}
                              className="px-4 py-2 bg-[#ffe5e5] text-[#d93025] hover:bg-[#ffd1d1] active:scale-[0.98] transition-all rounded-3xl text-[13px] font-semibold flex items-center gap-1.5"
                            >
                              <X size={14} />
                              {t.reject}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1">Action completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </RevealOnScroll>

      {viewComplaint && (
        <CaseDetailsModal
          complaint={viewComplaint}
          onClose={() => setViewComplaint(null)}
          t={t}
          showVideo={false}
        />
      )}

      {playingVideoUrl && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-4xl rounded-[20px] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden relative flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white">Video Evidence</h3>
              <button
                onClick={() => setPlayingVideoUrl(null)}
                className="px-3 py-1.5 text-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:bg-white/5 text-[#1d1d1f] dark:text-white transition-colors"
              >
                Close
              </button>
            </div>
            <div className="p-6 bg flex items-center justify-center">
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm w-full bg-black">
                <video
                  src={playingVideoUrl}
                  controls
                  autoPlay
                  controlsList="download"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-auto max-h-[65vh] mx-auto outline-none"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PoliceDashboard;
