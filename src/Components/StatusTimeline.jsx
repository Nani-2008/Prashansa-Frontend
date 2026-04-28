import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, Shield, FileText, Search } from "lucide-react";

const TimelineNode = ({ 
  status, 
  label, 
  timestamp, 
  isActive, 
  isCompleted, 
  isTerminal,
  terminalType,
  index,
  totalNodes 
}) => {
  // Determine colors based on status
  const getNodeColors = () => {
    if (terminalType === 'verified') {
      return {
        bg: 'bg-green-50',
        border: 'border-green-400',
        dotBg: 'bg-green-500',
        dotShadow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
        text: 'text-green-700',
        accent: 'text-green-600'
      };
    }
    if (terminalType === 'rejected' || terminalType === 'closed') {
      return {
        bg: 'bg-red-50',
        border: 'border-red-400',
        dotBg: 'bg-red-500',
        dotShadow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
        text: 'text-red-700',
        accent: 'text-red-600'
      };
    }
    if (terminalType === 'resolved') {
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-400',
        dotBg: 'bg-purple-500',
        dotShadow: 'shadow-[0_0_20px_rgba(124,58,237,0.5)]',
        text: 'text-purple-700',
        accent: 'text-purple-600'
      };
    }
    if (isActive) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-400',
        dotBg: 'bg-[#0066cc]',
        dotShadow: 'shadow-[0_0_20px_rgba(0,102,204,0.5)]',
        text: 'text-[#0066cc]',
        accent: 'text-[#0066cc]'
      };
    }
    if (isCompleted) {
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        dotBg: 'bg-gray-400',
        dotShadow: 'shadow-none',
        text: 'text-gray-600',
        accent: 'text-gray-500'
      };
    }
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      dotBg: 'bg-gray-200',
      dotShadow: 'shadow-none',
      text: 'text-gray-400',
      accent: 'text-gray-400'
    };
  };

  const colors = getNodeColors();
  const IconComponent = terminalType === 'verified' ? CheckCircle : 
                       terminalType === 'rejected' || terminalType === 'closed' ? XCircle :
                       status === 'Complaint Submitted' ? FileText :
                       status === 'Under Review' ? Search :
                       status === 'Verification in Progress' ? Shield : Clock;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: index * 0.15, 
        duration: 0.5, 
        ease: "easeOut" 
      }}
      className="relative flex gap-4"
    >
      {/* Timeline Line */}
      {index < totalNodes - 1 && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5">
          {isCompleted || isTerminal ? (
            <motion.div 
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
              className={`w-full h-full ${isTerminal ? (terminalType === 'verified' ? 'bg-green-500' : 'bg-red-500') : colors.dotBg}`}
              style={{ transformOrigin: 'top' }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      )}

      {/* Fade indicator for active states */}
      {isActive && !isTerminal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.15 + 0.5 }}
          className="absolute left-[11px] -top-3 w-0.5 h-3 bg-gradient-to-b from-[#0066cc] to-transparent"
        />
      )}

      {/* Node Dot */}
      <div className="relative z-10 flex-shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: index * 0.15 + 0.2, 
            type: "spring", 
            stiffness: 200, 
            damping: 15 
          }}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            ${colors.bg} ${colors.border} border-2
            ${isActive || isTerminal ? colors.dotShadow : ''}
            transition-all duration-300
          `}
        >
          <IconComponent 
            size={14} 
            className={colors.dotBg.includes('bg-') ? colors.dotBg.replace('bg-', 'text-') : colors.dotBg.replace('bg', 'text')} 
            strokeWidth={2.5}
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${index === totalNodes - 1 ? 'pb-0' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.15 + 0.3, 
            duration: 0.4 
          }}
        >
          <div className="flex items-center gap-2">
            <span className={`font-medium text-[15px] ${isActive || isTerminal ? colors.text : 'text-gray-600'}`}>
              {label}
            </span>
            {isActive && (
              <motion.span 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15 + 0.5 }}
                className={`w-2 h-2 rounded-full ${colors.dotBg} animate-pulse`}
              />
            )}
          </div>
          
          {/* Timestamp */}
          {timestamp && (
            <p className={`text-xs mt-1 font-medium ${isActive || isTerminal ? colors.accent : 'text-gray-400'}`}>
              {new Date(timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatusTimeline = ({ complaint, t }) => {
  // Build timeline based on complaint status and assignment history
  const buildTimeline = () => {
    const timeline = [];
    const history = complaint.assignmentHistory || [];

    // Always start with Complaint Submitted
    timeline.push({
      status: 'Complaint Submitted',
      label: t.complaintSubmitted || 'Complaint Submitted',
      timestamp: complaint.date,
      isCompleted: true,
      isActive: false,
      isTerminal: false,
      terminalType: null
    });

    // Check if Under Review
    const hasUnderReview = history.some(h => 
      h.action.toLowerCase().includes('review') || 
      h.action.toLowerCase().includes('assign')
    );
    
    if (hasUnderReview || complaint.assignedTo) {
      const reviewEntry = history.find(h => 
        h.action.toLowerCase().includes('review') || 
        h.action.toLowerCase().includes('assign')
      );
      
      timeline.push({
        status: 'Under Review',
        label: t.underReview || 'Under Review',
        timestamp: reviewEntry?.timestamp || null,
        isCompleted: true,
        isActive: false,
        isTerminal: false,
        terminalType: null
      });
    }

    // Check if Verification in Progress
    const hasVerification = history.some(h => 
      h.action.toLowerCase().includes('verification') ||
      h.action.toLowerCase().includes('verified')
    );

    if (hasVerification && complaint.status !== 'verified' && complaint.status !== 'rejected' && complaint.status !== 'closed' && complaint.status !== 'resolved') {
      const verificationEntry = history.find(h => 
        h.action.toLowerCase().includes('verification')
      );

      timeline.push({
        status: 'Verification in Progress',
        label: t.verificationInProgress || 'Verification in Progress',
        timestamp: verificationEntry?.timestamp || null,
        isCompleted: false,
        isActive: true,
        isTerminal: false,
        terminalType: null
      });
    } else if (hasVerification && complaint.status === 'resolved') {
      const verificationEntry = history.find(h => 
        h.action.toLowerCase().includes('verification') || h.action.toLowerCase().includes('verified')
      );

      timeline.push({
        status: 'Case Verified',
        label: t.caseVerified || 'Verified',
        timestamp: verificationEntry?.timestamp || null,
        isCompleted: true,
        isActive: false,
        isTerminal: false,
        terminalType: null
      });
    }

    // Terminal states
    if (complaint.status === 'verified') {
      const verifiedEntry = history.find(h => 
        h.action.toLowerCase().includes('verified')
      );
      
      timeline.push({
        status: 'Case Verified',
        label: t.caseVerified || 'Case Verified',
        timestamp: verifiedEntry?.timestamp || null,
        isCompleted: false,
        isActive: false,
        isTerminal: true,
        terminalType: 'verified'
      });
    } else if (complaint.status === 'rejected' || complaint.status === 'closed') {
      const rejectedEntry = history.find(h => 
        h.action.toLowerCase().includes('reject') ||
        h.action.toLowerCase().includes('closed')
      );
      
      timeline.push({
        status: 'Case Closed',
        label: t.caseClosed || 'Case Closed',
        timestamp: rejectedEntry?.timestamp || null,
        isCompleted: false,
        isActive: false,
        isTerminal: true,
        terminalType: 'rejected'
      });
    } else if (complaint.status === 'resolved') {
      timeline.push({
        status: 'Case Resolved',
        label: t.caseResolved || 'Case Resolved',
        timestamp: null,
        isCompleted: false,
        isActive: false,
        isTerminal: true,
        terminalType: 'resolved'
      });
    }

    return timeline;
  };

  const timelineData = buildTimeline();

  return (
    <div className="relative">
      <AnimatePresence>
        {timelineData.map((item, index) => (
          <TimelineNode
            key={item.status}
            status={item.status}
            label={item.label}
            timestamp={item.timestamp}
            isActive={item.isActive}
            isCompleted={item.isCompleted}
            isTerminal={item.isTerminal}
            terminalType={item.terminalType}
            index={index}
            totalNodes={timelineData.length}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default StatusTimeline;
