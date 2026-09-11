import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth";
import { PageLoader } from "../components/ui";
import { ROUTES } from "./paths";
import { Role } from "../types";

// ─── RequireAuth ────────────────────────────────────────────────────────────

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return <>{children}</>;
}

// ─── RequireRole ────────────────────────────────────────────────────────────

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isInitialized, hasRole } = useAuth();

  if (!isInitialized) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!hasRole(...roles)) {
    if (user?.role === Role.CLUB_LEADER) return <Navigate to={ROUTES.LEADER_HOME} replace />;
    if (user?.role === Role.STUDENT) return <Navigate to="/student" replace />;
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}

// ─── GuestOnly ──────────────────────────────────────────────────────────────

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, user } = useAuth();

  if (!isInitialized) return <PageLoader />;
  if (isAuthenticated) {
    if (user?.role === Role.CLUB_LEADER) return <Navigate to={ROUTES.LEADER_HOME} replace />;
    if (user?.role === Role.STUDENT) return <Navigate to="/student" replace />;
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
