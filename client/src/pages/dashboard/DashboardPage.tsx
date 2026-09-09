import { useAuth } from "../../features/auth";
import { Card, CardBody } from "../../components/ui";
import { Stack } from "../../components/layout";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-semibold)", marginBottom: "var(--space-1)" }}>
        Welcome back, {user?.firstName}
      </h2>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--text-base)" }}>
        Here's an overview of your club activities.
      </p>

      <Stack gap="md">
        <Card>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-primary-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 17v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2" />
                  <circle cx="8" cy="6" r="4" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-0-5)" }}>
                  Your Role
                </div>
                <div style={{ fontSize: "var(--text-md)", fontWeight: "var(--font-semibold)", textTransform: "capitalize" }}>
                  {user?.role?.replace("_", " ")}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Stack>
    </div>
  );
}
