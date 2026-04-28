import { createPortal } from "react-dom";

const CaseDetailsModal = ({ complaint, onClose, showVideo = true, users = [] }) => {
  if (!complaint) return null;

  const reporterName = users?.find(u => u.phone === complaint.reporterPhone)?.name || "Unknown";

  const detailRows = [
    ["Case ID", complaint.id],
    ["Type", complaint.type],
    ["Status", complaint.status],
    ["Assigned To", complaint.assignedTo || "Unassigned"],
    ["Reporter Name", reporterName],
    ["Reporter Role", complaint.reporterRole || "Unknown"],
    ["Reporter Phone", complaint.reporterPhone || "Anonymous"],
    ["Date Filed", complaint.date || "-"],
    ["Location", complaint.location || "-"],
    ["Incident Date", complaint.incidentDate || "-"],
    ["Incident Time", complaint.incidentTime || "-"]
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-2xl rounded-[20px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden min-h-0">
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md z-10">
          <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white">Case Details</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-3xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {detailRows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-[#86868b] dark:text-[#a1a1a6] font-medium">{label}</span>
              <span className="col-span-2 text-[#1d1d1f] dark:text-white break-words">{String(value)}</span>
            </div>
          ))}

          <div className="pt-2">
            <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm font-medium mb-1">Description</p>
            <p className="text-[#1d1d1f] dark:text-white text-sm leading-relaxed bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-lg p-3">
              {complaint.description || "No description provided."}
            </p>
          </div>

          {showVideo && complaint.videoUrl && (
            <div className="pt-4">
              <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm font-medium mb-2">Video Evidence</p>
              <div className="rounded-xl overflow-hidden bg-black/5 dark:bg-black/20 border border-gray-200 dark:border-white/10 flex justify-center items-center">
                <video 
                  src={complaint.videoUrl} 
                  controls 
                  controlsList="nodownload" 
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {complaint.audioUrl && (
            <div className="pt-4">
              <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm font-medium mb-2">Voice Complaint</p>
              <div className="rounded-xl overflow-hidden bg-blue-50 dark:bg-[#1c1c1e] border border-blue-100 dark:border-white/10 p-4 flex justify-center items-center">
                <audio 
                  src={complaint.audioUrl} 
                  controls 
                  controlsList="nodownload"
                  className="w-full max-w-md"
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CaseDetailsModal;
