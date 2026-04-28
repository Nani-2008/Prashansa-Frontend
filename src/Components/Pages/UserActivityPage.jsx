import { useState, useMemo } from "react";
import { Users, FileText, Shield, Scale, Heart, TrendingUp, BarChart3, Activity } from "lucide-react";
import RevealOnScroll from "../RevealOnScroll";
import InteractiveDonut from "../InteractiveDonut";

const UserActivityPage = ({ t, users = [], complaints = [] }) => {
  const [timeRange, setTimeRange] = useState("all"); // 'week', 'month', 'all'

  // Role distribution data
  const roleData = useMemo(() => {
    const roles = { user: 0, admin: 0, police: 0, lawyer: 0, counsellor: 0 };
    users.forEach(u => { if (roles[u.role] !== undefined) roles[u.role]++; });
    return roles;
  }, [users]);

  // Case status distribution
  const statusData = useMemo(() => {
    const statuses = { pending: 0, verified: 0, rejected: 0 };
    complaints.forEach(c => { if (statuses[c.status] !== undefined) statuses[c.status]++; });
    return statuses;
  }, [complaints]);

  // Assignment distribution
  const assignmentData = useMemo(() => {
    const assigns = { unassigned: 0, police: 0, lawyer: 0, counsellor: 0 };
    complaints.forEach(c => {
      if (!c.assignedTo) assigns.unassigned++;
      else if (assigns[c.assignedTo] !== undefined) assigns[c.assignedTo]++;
    });
    return assigns;
  }, [complaints]);

  // Complaint types distribution
  const typeData = useMemo(() => {
    const types = {};
    complaints.forEach(c => {
      const type = c.type || "Unknown";
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }, [complaints]);

  const totalUsers = users.length;
  const totalComplaints = complaints.length;
  const activeOfficials = users.filter(u => ['police', 'lawyer', 'counsellor'].includes(u.role)).length;
  const resolvedRate = totalComplaints > 0
    ? Math.round((statusData.verified / totalComplaints) * 100)
    : 0;

  // Color configs
  const roleColors = {
    user: { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-50" },
    admin: { bg: "bg-indigo-500", text: "text-indigo-500", light: "bg-indigo-50" },
    police: { bg: "bg-green-500", text: "text-green-500", light: "bg-green-50" },
    lawyer: { bg: "bg-purple-500", text: "text-purple-500", light: "bg-purple-50" },
    counsellor: { bg: "bg-pink-500", text: "text-pink-500", light: "bg-pink-50" }
  };

  const statusColors = {
    pending: { bg: "bg-yellow-500", text: "text-yellow-600", light: "bg-yellow-50" },
    verified: { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50" },
    rejected: { bg: "bg-red-500", text: "text-red-500", light: "bg-red-50" }
  };

  const assignColors = {
    unassigned: { bg: "bg-gray-400", text: "text-gray-500" },
    police: { bg: "bg-green-500", text: "text-green-600" },
    lawyer: { bg: "bg-purple-500", text: "text-purple-600" },
    counsellor: { bg: "bg-pink-500", text: "text-pink-600" }
  };

  // Donut chart - now using InteractiveDonut component

  // Bar chart component
  const BarChart = ({ data, colors, maxHeight = 160 }) => {
    const values = Object.values(data);
    const max = Math.max(...values, 1);
    const entries = Object.entries(data);

    return (
      <div className="flex items-end justify-around gap-3 w-full" style={{ height: maxHeight + 40 }}>
        {entries.map(([key, value]) => {
          const height = Math.max((value / max) * maxHeight, 4);
          const colorMap = {
            "bg-blue-500": "#3b82f6", "bg-indigo-500": "#6366f1",
            "bg-green-500": "#22c55e", "bg-purple-500": "#a855f7",
            "bg-pink-500": "#ec4899", "bg-yellow-500": "#eab308",
            "bg-red-500": "#ef4444", "bg-gray-400": "#9ca3af"
          };
          const bgClass = colors[key]?.bg || "bg-gray-400";
          const color = colorMap[bgClass] || "#9ca3af";

          return (
            <div key={key} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-xs font-bold text-[#1d1d1f] dark:text-white">{value}</span>
              <div
                className="w-full max-w-[48px] rounded-t-xl transition-all duration-700 relative overflow-hidden"
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

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-transparent py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#0066cc]/10 to-[#0066cc]/5 rounded-2xl border border-[#0066cc]/10">
              <Activity size={28} className="text-[#0066cc]" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                User Activity
              </h1>
              <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1">Platform analytics and insights</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <RevealOnScroll delay={40}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-2">
            <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Total Users</h4>
                <div className="p-2 bg-blue-50 rounded-full"><Users size={18} className="text-[#0066cc]" /></div>
              </div>
              <p className="text-4xl font-semibold tracking-tight text-[#0066cc]">{totalUsers}</p>
            </div>

            <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Total Cases</h4>
                <div className="p-2 bg-yellow-50 rounded-full"><FileText size={18} className="text-yellow-600" /></div>
              </div>
              <p className="text-4xl font-semibold tracking-tight text-yellow-600">{totalComplaints}</p>
            </div>

            <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Officials</h4>
                <div className="p-2 bg-green-50 rounded-full"><Shield size={18} className="text-green-600" /></div>
              </div>
              <p className="text-4xl font-semibold tracking-tight text-green-600">{activeOfficials}</p>
            </div>

            <div className="group bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 hover:-translate-y-1 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <h4 className="text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">Resolved</h4>
                <div className="p-2 bg-emerald-50 rounded-full"><TrendingUp size={18} className="text-emerald-600" /></div>
              </div>
              <p className="text-4xl font-semibold tracking-tight text-emerald-600">{resolvedRate}%</p>
            </div>
          </div>
        </RevealOnScroll>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Role Distribution - Donut */}
          <RevealOnScroll delay={80}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-6 sm:p-8">
              <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">
                User Role Distribution
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <InteractiveDonut data={roleData} colors={roleColors} label="Users" size={200} />
                <div className="flex flex-col gap-3 flex-1">
                  {Object.entries(roleData).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full ${roleColors[role]?.bg}`} />
                        <span className="text-sm font-medium text-[#1d1d1f] dark:text-white capitalize">{role}</span>
                      </div>
                      <span className={`text-sm font-bold ${roleColors[role]?.text}`}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Case Status - Donut */}
          <RevealOnScroll delay={120}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-6 sm:p-8">
              <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">
                Case Status Breakdown
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <InteractiveDonut data={statusData} colors={statusColors} label="Cases" size={200} />
                <div className="flex flex-col gap-3 flex-1">
                  {Object.entries(statusData).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full ${statusColors[status]?.bg}`} />
                        <span className="text-sm font-medium text-[#1d1d1f] dark:text-white capitalize">{status}</span>
                      </div>
                      <span className={`text-sm font-bold ${statusColors[status]?.text}`}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Assignment Distribution - Bar */}
          <RevealOnScroll delay={160}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-6 sm:p-8">
              <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">
                Case Assignments
              </h4>
              <BarChart data={assignmentData} colors={assignColors} />
            </div>
          </RevealOnScroll>

          {/* Complaint Types - Bar */}
          <RevealOnScroll delay={200}>
            <div className="bg-white/40 dark:bg-[#1e2333]/70 backdrop-blur-2xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-white/10 p-6 sm:p-8">
              <h4 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">
                Complaint Types
              </h4>
              {Object.keys(typeData).length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-sm text-[#86868b]">No complaints filed yet</div>
              ) : (
                <BarChart
                  data={typeData}
                  colors={Object.fromEntries(
                    Object.keys(typeData).map((k, i) => [
                      k,
                      { bg: ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-yellow-500", "bg-indigo-500", "bg-red-500"][i % 7] }
                    ])
                  )}
                />
              )}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
};

export default UserActivityPage;
