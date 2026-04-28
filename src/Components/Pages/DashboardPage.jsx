import AdminDashboard from "../Dashboards/AdminDashboard";
import PoliceDashboard from "../Dashboards/PoliceDashboard";
import LawyerDashboard from "../Dashboards/LawyerDashboard";
import CounsellorDashboard from "../Dashboards/CounsellorDashboard";
import UserDashboard from "../Dashboards/UserDashboard";
import RevealOnScroll from "../RevealOnScroll";

const DashboardPage = ({
  t,
  userRole,
  complaints,
  allComplaints,
  patchComplaint,
  deleteComplaint,
  currentUser,
  users,
  handleGrantRole,
  handleAddUser,
  handleDeleteUser,
  setCurrentPage,
  setChatCaseId,
  showAssignSuccess,
  refreshComplaints,
  refreshUsers
}) => {
  const safePatchComplaint = async (id, payload) => {
    if (typeof patchComplaint !== "function") {
      throw new Error("Complaint update handler is not available. Please refresh the page.");
    }
    return patchComplaint(id, payload);
  };

  const dashboardMap = {
    admin: (
      <AdminDashboard
        t={t}
        complaints={allComplaints || complaints}
        patchComplaint={safePatchComplaint}
        deleteComplaint={deleteComplaint}
        users={users}
        handleGrantRole={handleGrantRole}
        handleAddUser={handleAddUser}
        handleDeleteUser={handleDeleteUser}
        currentUser={currentUser}
        showAssignSuccess={showAssignSuccess}
        refreshComplaints={refreshComplaints}
        refreshUsers={refreshUsers}
      />
    ),

    police: (
      <PoliceDashboard
        t={t}
        complaints={complaints}
        patchComplaint={safePatchComplaint}
        currentUser={currentUser}
        showAssignSuccess={showAssignSuccess}
        refreshComplaints={refreshComplaints}
      />
    ),

    lawyer: (
      <LawyerDashboard
        t={t}
        complaints={complaints}
        patchComplaint={safePatchComplaint}
        currentUser={currentUser}
        showAssignSuccess={showAssignSuccess}
        refreshComplaints={refreshComplaints}
      />
    ),

    counsellor: (
      <CounsellorDashboard
        t={t}
        complaints={complaints}
        setCurrentPage={setCurrentPage}
        setChatCaseId={setChatCaseId}
        refreshComplaints={refreshComplaints}
      />
    ),

    user: (
      <UserDashboard
        t={t}
        complaints={complaints}
        currentUser={currentUser}
        patchComplaint={safePatchComplaint}
        showAssignSuccess={showAssignSuccess}
        refreshComplaints={refreshComplaints}
      />
    )
  };

  const roleComponent =
    dashboardMap[userRole] || dashboardMap["user"];

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-transparent py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-4 transition-colors">
          {t.dashboard}
        </h1>

        <div className="w-full">
          <RevealOnScroll delay={80}>
            {roleComponent}
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
