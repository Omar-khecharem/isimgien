import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { StudentLayout } from "../components/student";
import { RequireAuth, RequireRole, GuestOnly } from "./guards";
import { ROUTES } from "./paths";
import { Role } from "../types";
import { useAuth } from "../features/auth";

// Pages
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { DesignSystemPage } from "../pages/design-system/DesignSystemPage";
import { StudentDashboard } from "../components/student";
import { ClubLeaderDashboard } from "../features/clubLeader";
import { AttendanceSessionPage } from "../features/attendance";
import { SuperAdminDashboard } from "../pages/dashboard/SuperAdminDashboard";
import { AdminSettings } from "../pages/settings/AdminSettings";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminEvents } from "../pages/admin/AdminEvents";

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
            <StudentLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <StudentDashboard />,
          },
          {
            path: "events",
            element: <PlaceholderPage title="Événements & Formations" />,
          },
          {
            path: "clubs",
            element: <PlaceholderPage title="Clubs" />,
          },
          {
            path: "registrations",
            element: <PlaceholderPage title="Formulaires & Inscriptions" />,
          },
          {
            path: "attendance",
            element: <PlaceholderPage title="Membres & Présences" />,
          },
          {
            path: "settings",
            element: <PlaceholderPage title="Paramètres" />,
          },
          {
            path: "help",
            element: <PlaceholderPage title="Aide & Support" />,
          },
        ],
      },

      // ─── Dashboard (admin/leader) ───────────────────────────
      {
        path: ROUTES.DASHBOARD,
        element: (
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <RoleDashboard /> },
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
            element: <PlaceholderPage title="All Clubs" />,
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
            element: <PlaceholderPage title="Global Attendance" />,
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
            element: <PlaceholderPage title="Formulaires & Inscriptions" />,
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
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>{title}</h2>
      <p style={{ color: "var(--color-text-secondary)", marginTop: 8 }}>
        This page will be implemented in a future iteration.
      </p>
    </div>
  );
}

// Renders the appropriate dashboard based on user role
function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === Role.SUPER_ADMIN) {
    return <SuperAdminDashboard />;
  }
  if (user?.role === Role.CLUB_LEADER) {
    return <ClubLeaderDashboard />;
  }
  return <DashboardPage />;
}
