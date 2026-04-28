import { useState } from "react";
import { Search, Activity, Shield } from "lucide-react";
import StatusTimeline from "../StatusTimeline";
import RevealOnScroll from "../RevealOnScroll";

const TrackPage = ({ t, complaints, currentUser }) => {
  const [searchId, setSearchId] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  const handleTrack = () => {
    if (!searchId) return;

    let results = [];

    // Admin can see all cases
    if (currentUser?.role === 'admin') {
      results = complaints.filter((c) =>
        c.id.toLowerCase().includes(searchId.toLowerCase())
      );
    }
    // Regular users can only search their own cases by phone
    else if (currentUser) {
      results = complaints.filter((c) =>
        c.id.toLowerCase().includes(searchId.toLowerCase()) &&
        c.reporterPhone === currentUser.phone
      );
    }
    // Not logged in - redirect to login
    else {
      alert("Please login to track your complaint");
      return;
    }

    setFilteredResults(results);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fbfbfd] dark:bg-transparent py-16 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Search Box */}
        <RevealOnScroll delay={50} y={18} blur={10}>
          <div className="bg-white/70 dark:bg-[#1e2333]/70 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-[#0066cc]/10 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="flex flex-col gap-2 mb-8 text-center sm:text-left relative z-10">
              <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                {t.trackComplaint || 'Track Your Report'}
              </h2>
              <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">Enter your unique Case ID to view real-time status updates.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-[#0066cc]">
                  <Search size={18} className="text-current" />
                </div>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="CASE-2026-001234"
                  className="w-full pl-11 pr-4 py-4 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-full text-[15px] font-medium text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] dark:text-[#a1a1a6]/70 focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 focus:shadow-[0_8px_30px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 outline-none uppercase tracking-wide"
                />
              </div>

              <button
                onClick={handleTrack}
                className="w-full sm:w-auto px-8 py-4 bg-[#2d2d2d] dark:bg-[#2d2d2d] text-white font-medium text-[15px] rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:bg-black dark:hover:bg-black hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)] active:scale-[0.98] transition-all duration-300"
              >
                {t.track}
              </button>
            </div>
          </div>
        </RevealOnScroll>

        {/* Results */}
        <div className="flex flex-col gap-4">
          {filteredResults.length === 0 && searchId && (
            <RevealOnScroll delay={90}>
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1e2333]/70 rounded-[24px] border border-gray-100/50 dark:border-white/5 shadow-sm text-center">
                <Activity size={32} className="text-gray-300 mb-4" />
                <p className="text-[#1d1d1f] dark:text-white font-medium text-[15px]">No case found.</p>
                <p className="text-[#86868b] dark:text-[#a1a1a6] text-[14px] mt-1">Please check your Case ID and try again.</p>
              </div>
            </RevealOnScroll>
          )}

          {filteredResults.map((complaint, index) => (
            <RevealOnScroll key={complaint.id} delay={110 + index * 60}>
              <div
                className="group bg-white/70 dark:bg-[#1e2333]/70 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10 hover:backdrop-blur-2xl hover:border-white/80 hover:shadow-[0_12px_40px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all duration-500 flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100/50 dark:border-white/5 pb-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-xl tracking-tight text-[#1d1d1f] dark:text-white">
                      {complaint.id}
                    </h3>
                    <p className="text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                      Filed on {complaint.date}
                    </p>
                  </div>

                  <div
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide uppercase self-start sm:self-auto ${complaint.status === "verified"
                        ? "bg-[#e5f5ea] text-[#008f39] border border-[#008f39]/20"
                        : complaint.status === "resolved"
                          ? "bg-[#f3e8ff] text-[#7c3aed] border border-[#7c3aed]/20"
                          : complaint.status === "rejected"
                            ? "bg-[#ffe5e5] text-[#d93025] border border-[#d93025]/20"
                            : "bg-[#fff5e5] text-[#cc7000] border border-[#cc7000]/20"
                      }`}
                  >
                    {complaint.status === "verified"
                      ? t.verified
                      : complaint.status === "resolved"
                        ? t.caseResolved || "Resolved"
                        : complaint.status === "rejected"
                          ? t.rejected || "Rejected"
                          : t.pending}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div>
                    <span className="text-[12px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Incident Type</span>
                    <p className="text-[15px] font-medium text-[#1d1d1f] dark:text-white mt-0.5">{complaint.type}</p>
                  </div>

                  <div>
                    <span className="text-[12px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Description</span>
                    <p className="text-[14px] leading-relaxed text-[#1d1d1f] dark:text-white/80 mt-1">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Timeline - New Animated Vertical Timeline */}
                  {complaint.assignmentHistory && complaint.assignmentHistory.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100/50 dark:border-white/5">
                      <span className="text-[12px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-4 block">
                        {t.caseHistory || 'Case Timeline'}
                      </span>
                      <StatusTimeline complaint={complaint} t={t} />
                    </div>
                  )}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
