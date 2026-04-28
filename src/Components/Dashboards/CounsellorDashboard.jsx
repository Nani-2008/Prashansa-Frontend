import { HeartHandshake, ChevronRight, RefreshCw } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";

const CounsellorDashboard = ({
  t,
  complaints,
  setCurrentPage,
  setChatCaseId,
  refreshComplaints
}) => {

  // Show cases assigned to counsellor
  const assignedCases = complaints.filter(
    (c) => c.assignedTo === "counsellor"
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 mb-2 px-1">
        <div className="p-2 bg-pink-50/80 rounded-full border border-pink-100">
          <HeartHandshake size={24} className="text-pink-600" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
          {t.counsellorDashboard}
        </h3>
      </div>

      <RevealOnScroll delay={60}>
      <div className="bg-white/40 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            {t.assignedCases}
          </h4>
          <button
            onClick={refreshComplaints}
            className="flex items-center gap-2 bg-[#f5f5f7] hover:bg-gray-200 text-[#1d1d1f] px-4 py-2 rounded-3xl transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {assignedCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md rounded-[16px] border border-white/80 border-dashed">
            <HeartHandshake size={32} className="text-gray-300 mb-3" />
            <p className="text-[#1d1d1f] font-medium text-[15px]">No cases assigned to you.</p>
            <p className="text-[#86868b] text-[14px] mt-1">Cases assigned by lawyers will appear here for support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedCases.map((complaint) => (
              <div
                key={complaint.id}
                className="group p-5 sm:p-6 bg-white/50 backdrop-blur-md border border-white/60 rounded-[16px] hover:bg-[#0066cc]/[0.02] hover:backdrop-blur-xl hover:border-white/80 hover:shadow-[0_8px_24px_rgba(0,102,204,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-500 flex flex-col h-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <h5 className="font-semibold text-lg tracking-tight text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors">
                    {complaint.id}
                  </h5>
                  <div className="px-2.5 py-1 bg-white/60 backdrop-blur-sm border border-white/80 rounded-full text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                    {complaint.type}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide
                    ${complaint.status === "verified"
                      ? "bg-[#e5f5ea] text-[#008f39]"
                      : complaint.status === "rejected"
                        ? "bg-[#ffe5e5] text-[#d93025]"
                        : complaint.status === "resolved"
                          ? "bg-[#f3e8ff] text-[#7c3aed]"
                          : "bg-[#fff5e5] text-[#cc7000]"
                    }`}>
                    {complaint.status === "verified" ? "Verified"
                      : complaint.status === "rejected" ? "Rejected"
                      : complaint.status === "resolved" ? "Resolved"
                      : "Pending"}
                  </span>
                </div>

                <div className="flex-grow relative z-10">
                  <p className="text-[14px] leading-relaxed text-[#1d1d1f]/70 line-clamp-2">
                    {complaint.description}
                  </p>
                </div>

                {complaint.status !== "resolved" && (
                <button
                  onClick={() => {
                    setChatCaseId(complaint.id);
                    setCurrentPage("chat");
                  }}
                  className="w-full mt-5 py-3 bg-white/80 backdrop-blur-md border border-white/60 hover:bg-white hover:border-[#0066cc]/30 text-[#1d1d1f] group-hover:text-[#0066cc] rounded-3xl text-[14px] font-medium transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,102,204,0.08)] relative z-10"
                >
                  <HeartHandshake size={16} />
                  <span>{t.supportCases}</span>
                </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </RevealOnScroll>
    </div>
  );
};

export default CounsellorDashboard;
