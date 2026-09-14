import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { RequireAuth, RequireRole, GuestOnly } from "./guards";
import { ROUTES } from "./paths";
import { Role } from "../types";
import { useAuth } from "../features/auth";

// Pages
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { DesignSystemPage } from "../pages/design-system/DesignSystemPage";
import { StudentDashboard, StudentSettingsPage, StudentClubsPage, StudentEventsPage, StudentAttendancePage, StudentPastEventsPage, StudentContactPage } from "../components/student";
import { ClubLeaderDashboard } from "../features/clubLeader";
import { ClubProfile } from "../features/clubLeader/ClubProfile";
import LeaderMembersPage from "../features/clubLeader/LeaderMembersPage";
import LeaderFormsPage from "../features/clubLeader/LeaderFormsPage";
import LeaderFinancePage from "../features/clubLeader/LeaderFinancePage";
import LeaderFormationsPage from "../features/clubLeader/LeaderFormationsPage";
import LeaderNotificationsPage from "../features/clubLeader/LeaderNotificationsPage";
import LeaderSettingsPage from "../features/clubLeader/LeaderSettingsPage";
import LeaderHelpPage from "../features/clubLeader/LeaderHelpPage";
import { AttendanceSessionPage } from "../features/attendance";
import { SuperAdminDashboard } from "../pages/dashboard/SuperAdminDashboard";
import { AdminSettings } from "../pages/settings/AdminSettings";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminEvents } from "../pages/admin/AdminEvents";
import { AdminClubs } from "../pages/admin/AdminClubs";
import { AdminForms } from "../pages/admin/AdminForms";
import { AdminAttendance } from "../pages/admin/AdminAttendance";
import AdminContactPage from "../pages/admin/AdminContact";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ─── Public ─────────────────────────────────────────────
      {
        element: <PublicLayout />,
        children: [
          { path: ROUTES.HOME, element: <HomePage /> },
        ],
      },

      // ─── Auth ───────────────────────────────────────────────
      {
        path: ROUTES.LOGIN,
        element: (
          <GuestOnly>
            <AuthLayout />
          </GuestOnly>
        ),
        children: [
          { index: true, element: <LoginPage /> },
        ],
      },

      // ─── Design System ──────────────────────────────────────
      {
        path: "/design-system",
        element: (
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <DesignSystemPage /> },
        ],
      },

      // ─── Student Dashboard ──────────────────────────────────
      {
        path: "/student",
        element: (
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <StudentDashboard />,
          },
          {
            path: "events",
            element: <StudentEventsPage />,
          },
          {
            path: "clubs",
            element: <StudentClubsPage />,
          },
          {
            path: "attendance",
            element: <StudentAttendancePage />,
          },
          {
            path: "past-events",
            element: <StudentPastEventsPage />,
          },
          {
            path: "contact",
            element: <StudentContactPage />,
          },
          {
            path: "settings",
            element: <StudentSettingsPage />,
          },
          {
            path: "help",
            element: <PlaceholderPage title="Aide & Support" />,
          },
          {
            path: "memberships",
            element: <PlaceholderPage title="Mon Profil Étudiant" />,
          },
        ],
      },

      // ─── Dashboard (admin) ────────────────────────────────
      {
        path: ROUTES.DASHBOARD,
        element: (
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
        ],
      },

      // ─── Attendance Session (club leader) ───────────────────
      {
        path: ROUTES.ATTENDANCE,
        element: (
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <AttendanceSessionPage /> },
        ],
      },

      // ─── Club Leader ──────────────────────────────────────
      {
        path: "/leader",
        element: (
          <RequireAuth>
            <RequireRole roles={[Role.CLUB_LEADER]}>
              <DashboardLayout />
            </RequireRole>
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <ClubLeaderDashboard />,
          },
          {
            path: "profile",
            element: <ClubProfile />,
          },
          {
            path: "clubs",
            element: <LeaderFormationsPage />,
          },
          {
            path: "forms",
            element: <LeaderFormsPage />,
          },
          {
            path: "members",
            element: <LeaderMembersPage />,
          },
          {
            path: "finance",
            element: <LeaderFinancePage />,
          },
          {
            path: "reports",
            element: <PlaceholderPage title="Rapports & Stats" />,
          },
          {
            path: "notifications",
            element: <LeaderNotificationsPage />,
          },
          {
            path: "documents",
            element: <PlaceholderPage title="Documents" />,
          },
          {
            path: "settings",
            element: <LeaderSettingsPage />,
          },
          {
            path: "help",
            element: <LeaderHelpPage />,
          },
        ],
      },

      // ─── Super Admin ────────────────────────────────────────
      {
        path: "/admin",
        element: (
          <RequireAuth>
            <RequireRole roles={[Role.SUPER_ADMIN]}>
              <DashboardLayout />
            </RequireRole>
          </RequireAuth>
        ),
        children: [
          {
            path: "clubs",
            element: <AdminClubs />,
          },
          {
            path: "users",
            element: <AdminUsers />,
          },
          {
            path: "events",
            element: <AdminEvents />,
          },
          {
            path: "attendance",
            element: <AdminAttendance />,
          },
          {
            path: "finance",
            element: <PlaceholderPage title="Global Finance" />,
          },
          {
            path: "memberships",
            element: <PlaceholderPage title="Global Memberships" />,
          },
          {
            path: "forms",
            element: <AdminForms />,
          },
          {
            path: "contact",
            element: <AdminContactPage />,
          },
          {
            path: "settings",
            element: <AdminSettings />,
          },
          {
            path: "notifications",
            element: <PlaceholderPage title="Notifications" />,
          },
          {
            path: "help",
            element: <PlaceholderPage title="Aide & Support" />,
          },
        ],
      },

      // ─── Student (legacy routes) ────────────────────────────
      {
        path: "/my",
        element: (
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          {
            path: "registrations",
            element: <PlaceholderPage title="My Registrations" />,
          },
          {
            path: "attendance",
            element: <PlaceholderPage title="My Attendance" />,
          },
          {
            path: "memberships",
            element: <PlaceholderPage title="My Memberships" />,
          },
        ],
      },

      // ─── Catch-all ──────────────────────────────────────────
      {
        path: "*",
        element: <Navigate to={ROUTES.HOME} replace />,
      },
    ],
  },
]);

// Placeholder page for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-400 max-w-sm">
        Cette section sera implementée prochainement.
      </p>
    </div>
  );
}

// Renders the appropriate dashboard based on user role
function AdminDashboard() {
  const { user } = useAuth();
  if (user?.role === Role.SUPER_ADMIN) {
    return <SuperAdminDashboard />;
  }
  return <DashboardPage />;
}
