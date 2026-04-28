import { useMemo } from "react";
import { TrendingUp, CheckCircle, XCircle, Clock, ArrowRight, Shield, Scale, Heart, Activity } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";
import InteractiveDonut from "../InteractiveDonut";

const PerformancePage = ({ t, complaints = [], currentUser }) => {
  const role = currentUser?.role || "police";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const roleConfig = {
    police: { icon: Shield, color: "text-green-600", bgColor: "bg-green-50", accent: "#22c55e" },
    lawyer: { icon: Scale, color: "text-purple-600", bgColor: "bg-purple-50", accent: "#a855f7" },
    counsellor: { icon: Heart, color: "text-pink-600", bgColor: "bg-pink-50", accent: "#ec4899" }
  };
  const config = roleConfig[role] || roleConfig.police;
  const RoleIcon = config.icon;

  // Filter complaints relevant to this official
  const myCases = useMemo(() => {
    return complaints.filter(c => {
      // Cases assigned to this role
      if (c.assignedTo === role) return true;
      // Cases that have history entries by this role
      if (c.assignmentHistory && c.assignmentHistory.some(h => h?.by === roleLabel)) return true;
      return false;
    });
  }, [complaints, role, roleLabel]);

  // Calculate stats
  const stats = useMemo(() => {
    let verified = 0, rejected = 0, pending = 0, resolved = 0, assigned = 0, totalActioned = 0;

    myCases.forEach(c => {
      if (c.status === "verified") verified++;
      else if (c.status === "rejected") rejected++;
      else if (c.status === "resolved") resolved++;
      else pending++;

      // Count assignments made by this role
      if (c.assignmentHistory) {
        c.assignmentHistory.forEach(h => {
          if (h?.by === roleLabel && h?.action === "Assigned") assigned++;
          if (h?.by === roleLabel) totalActioned++;
        });
      }
    });

    return { verified, rejected, pending, resolved, assigned, totalActioned, totalCases: myCases.length };
  }, [myCases, roleLabel]);

  const resolutionBase = stats.verified + stats.resolved;
  const resolutionRate = resolutionBase > 0
    ? Math.round((stats.resolved / resolutionBase) * 100)
    : 0;

  // Color configs for charts
  const statusColors = {
    verified: { bg: "bg-green-500", text: "text-green-600", hex: "#22c55e" },
    rejected: { bg: "bg-red-500", text: "text-red-500", hex: "#ef4444" },
    pending: { bg: "bg-yellow-500", text: "text-yellow-600", hex: "#eab308" },
    resolved: { bg: "bg-purple-500", text: "text-purple-600", hex: "#7c3aed" }
  };

  // Donut Chart - now using InteractiveDonut component

  // Bar Chart
  const BarChart = ({ data, colors, maxHeight = 160 }) => {
    const values = Object.values(data);
    const max = Math.max(...values, 1);

    return (
      <div className="flex items-end justify-around gap-3 w-full" style={{ height: maxHeight + 40 }}>
        {Object.entries(data).map(([key, value]) => {
          const height = Math.max((value / max) * maxHeight, 4);
          const color = colors[key]?.hex || "#9ca3af";

          return (
            <div key={key} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-xs font-bold text-[#1d1d1f] dark:text-white">{value}</span>
              <div
                className="w-full max-w-[56px] rounded-t-xl transition-all duration-700 relative overflow-hidden"
                style={{ height, backgroundColor: color }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20" />
              </div>
              <span className="text-[11px] font-semibold text-[#86868b] dark:text-[#a1a1a6] capitalize text-center leading-tight">
                {key}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Progress ring for resolution rate
  const ProgressRing = ({ percentage, size = 120 }) => {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const filled = (percentage / 100) * circumference;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-gray-700" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={config.accent}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <text x={size/2} y={size/2 - 6} textAnchor="middle" className="fill-[#1d1d1f] dark:fill-white text-2xl font-bold">{percentage}%</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle" className="fill-[#86868b] text-[10px] font-medium">Resolved</text>
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-transparent py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2.5 ${config.bgColor} rounded-2xl border border-${config.accent}/10`}>
            <Activity size={28} className={config.color} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              My Performance
            </h1>
            <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1">{roleLabel} dashboard analytics</p>
          </div>
        </div>

        {/* Summary Cards */}
        <RevealOnScroll delay={40}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-2">
            {/* Total Cases */}
            <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Total Cases</h4>
                <div className={`p-2 ${config.bgColor} rounded-full`}><RoleIcon size={18} className={config.color} /></div>
              </div>
              <p className={`text-4xl font-semibold tracking-tight ${config.color}`}>{stats.totalCases}</p>
            </div>

            {/* Verified */}
            <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Verified</h4>
                <div className="p-2 bg-green-50 rounded-full"><CheckCircle size={18} className="text-green-600" /></div>
              </div>
              <p className="text-4xl font-semibold tracking-tight text-green-600">{stats.verified}</p>
            </div>

            {/* Rejected */}
            <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Rejected</h4>
                <div className="p-2 bg-red-50 rounded-full"><XCircle size={18} className="text-red-500" /></div>
              </div>
              <p className="text-4xl font-semibold tracking-tight text-red-500">{stats.rejected}</p>
            </div>

            {/* Pending */}
            <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Pending</h4>
                <div className="p-2 bg-yellow-50 rounded-full"><Clock size={18} className="text-yellow-600" /></div>
              </div>
              <p className="text-4xl font-semibold tracking-tight text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </RevealOnScroll>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Resolution Rate */}
          <RevealOnScroll delay={80}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-6 sm:p-8 flex flex-col items-center">
              <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6 self-start">
                Resolution Rate
              </h4>
              <ProgressRing percentage={resolutionRate} />
              <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-4 text-center">
                {stats.resolved} resolved out of {resolutionBase} verified + resolved cases
              </p>
            </div>
          </RevealOnScroll>

          {/* Case Status Donut */}
          <RevealOnScroll delay={120}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-6 sm:p-8">
              <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">
                Case Status Breakdown
              </h4>
              <div className="flex flex-col items-center gap-6">
                <InteractiveDonut
                  data={{ verified: stats.verified, rejected: stats.rejected, pending: stats.pending, resolved: stats.resolved }}
                  colors={statusColors}
                  label="Total Cases"
                  size={220}
                />
                <div className="flex gap-6 flex-wrap justify-center">
                  {Object.entries({ verified: stats.verified, rejected: stats.rejected, pending: stats.pending, resolved: stats.resolved }).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${statusColors[key].bg}`} />
                      <span className="text-sm text-[#86868b] dark:text-[#a1a1a6] capitalize">{key}</span>
                      <span className={`text-sm font-bold ${statusColors[key].text}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Actions Bar Chart */}
          <RevealOnScroll delay={160}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-6 sm:p-8">
              <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">
                Actions Taken
              </h4>
              <BarChart
                data={{
                  Approved: stats.verified,
                  Rejected: stats.rejected,
                  Pending: stats.pending,
                  Resolved: stats.resolved,
                  ...(role === "lawyer" ? { Assigned: stats.assigned } : {})
                }}
                colors={{
                  Approved: { hex: "#22c55e" },
                  Rejected: { hex: "#ef4444" },
                  Pending: { hex: "#eab308" },
                  Resolved: { hex: "#7c3aed" },
                  Assigned: { hex: "#a855f7" }
                }}
              />
            </div>
          </RevealOnScroll>
        </div>

        {/* Case Type Breakdown */}
        <RevealOnScroll delay={200}>
          <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-6 sm:p-8">
            <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">
              Cases by Type
            </h4>
            {myCases.length === 0 ? (
              <div className="flex items-center justify-center h-[160px] text-sm text-[#86868b]">No cases assigned yet</div>
            ) : (
              <BarChart
                data={Object.fromEntries(
                  Object.entries(
                    myCases.reduce((acc, c) => {
                      const type = c.type || "Unknown";
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {})
                  )
                )}
                colors={Object.fromEntries(
                  [...new Set(myCases.map(c => c.type || "Unknown"))].map((type, i) => [
                    type,
                    { hex: ["#3b82f6", "#a855f7", "#ec4899", "#22c55e", "#eab308", "#6366f1", "#ef4444"][i % 7] }
                  ])
                )}
              />
            )}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default PerformancePage;
