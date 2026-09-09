import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth";
import { PageLoader } from "../components/ui";
import { ROUTES } from "./paths";
import type { Role } from "../types";

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
  const { isAuthenticated, isInitialized, hasRole } = useAuth();

  if (!isInitialized) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!hasRole(...roles)) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <>{children}</>;
}

// ─── GuestOnly ──────────────────────────────────────────────────────────────

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <>{children}</>;
}
