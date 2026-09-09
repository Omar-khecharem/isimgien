import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth";
import { Avatar, Button } from "../components/ui";
import { Separator } from "../components/layout";
import { ROUTES } from "../routes/paths";
import { Role } from "../types";
import styles from "./DashboardLayout.module.css";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    to: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10.5" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="10.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: ROUTES.CLUBS,
    label: "Clubs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 7L9 2l7 5v8a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6.5 16V10h5v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: ROUTES.MY_REGISTRATIONS,
    label: "My Registrations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 6h6M6 9h6M6 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.STUDENT],
  },
  {
    to: ROUTES.MY_ATTENDANCE,
    label: "My Attendance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    roles: [Role.STUDENT],
  },
  {
    to: ROUTES.MY_MEMBERSHIPS,
    label: "My Memberships",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 7h14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.STUDENT],
  },
];

const ADMIN_ITEMS: NavItem[] = [
  {
    to: ROUTES.ADMIN_CLUBS,
    label: "All Clubs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 7L9 2l7 5v8a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6.5 16V10h5v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
  {
    to: ROUTES.ADMIN_USERS,
    label: "Users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 15c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="13" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 10c2 0 3.5 1.5 3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
  {
    to: ROUTES.ADMIN_GLOBAL_ATTENDANCE,
    label: "Attendance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
  {
    to: ROUTES.ADMIN_GLOBAL_FINANCE,
    label: "Finance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 7h14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 10h3M5 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
  {
    to: ROUTES.ADMIN_GLOBAL_MEMBERSHIPS,
    label: "Memberships",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 7h14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
];

export function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.roles || hasRole(...item.roles)
  );

  const filteredAdmin = ADMIN_ITEMS.filter(
    (item) => !item.roles || hasRole(...item.roles)
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>ISIMG</span>
            <span className={styles.logoText}>ClubHub</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            {filteredNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.DASHBOARD}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles["navLink--active"] : ""}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {filteredAdmin.length > 0 && (
            <div className={styles.navSection}>
              <Separator spacing="md" />
              <div className={styles.navSectionLabel}>Administration</div>
              {filteredAdmin.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles["navLink--active"] : ""}`
                  }
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <Separator />
          <div className={styles.userSection}>
            <Avatar
              name={user ? `${user.firstName} ${user.lastName}` : ""}
              size="sm"
            />
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user?.firstName} {user?.lastName}
              </div>
              <div className={styles.userRole}>
                {user?.role?.replace("_", " ")}
              </div>
            </div>
            <Button variant="ghost" size="xs" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className={styles.content}>
        <div className={styles.topbar}>
          <h1 className={styles.topbarTitle}>ISIMG ClubHub</h1>
        </div>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
