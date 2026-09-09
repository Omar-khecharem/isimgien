import { useState, useCallback, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth";
import { Avatar } from "../components/ui";
import { ROUTES } from "../routes/paths";
import { Role } from "../types";
import styles from "./DashboardLayout.module.css";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    to: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="6.5" height="6.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12.5" y="3" width="6.5" height="6.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="12.5" width="6.5" height="6.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12.5" y="12.5" width="6.5" height="6.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_CLUBS,
    label: "Clubs",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L4 5.5v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10v-5L11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    badge: "12",
  },
  {
    to: ROUTES.MY_REGISTRATIONS,
    label: "Inscriptions",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8h6M8 11.5h6M8 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.STUDENT],
  },
  {
    to: ROUTES.MY_ATTENDANCE,
    label: "Présences",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    roles: [Role.STUDENT],
  },
  {
    to: ROUTES.MY_MEMBERSHIPS,
    label: "Cotisations",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 9h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.STUDENT],
  },
];

const ADMIN_ITEMS: NavItem[] = [
  {
    to: ROUTES.ADMIN_USERS,
    label: "Membres",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 19c0-3 2.5-5.5 5-5.5s5 2.5 5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="15.5" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15.5 11.5c2 0 3.5 1.5 3.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
  {
    to: ROUTES.ADMIN_EVENTS,
    label: "Événements",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8.5h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 2.5v3.5M15 2.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11" cy="13.5" r="1.5" fill="currentColor" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
  {
    to: ROUTES.ADMIN_FORMS,
    label: "Formulaires",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8h6M8 11.5h6M8 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
  {
    to: ROUTES.ADMIN_GLOBAL_ATTENDANCE,
    label: "Présences",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 6v5.5l4 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    to: ROUTES.ADMIN_NOTIFICATIONS,
    label: "Notifications",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M16 8a5 5 0 10-10 0c0 5.5-2.5 7-2.5 7h15S16 13.5 16 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 18a2 2 0 01-3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    badge: "3",
    roles: [Role.SUPER_ADMIN, Role.CLUB_LEADER, Role.STUDENT],
  },
  {
    to: ROUTES.ADMIN_HELP,
    label: "Aide & Support",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.5 8.5a3 3 0 014.2 2c0 .8-.5 1.3-1.2 1.8v.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11.2" cy="15.5" r="0.7" fill="currentColor" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN, Role.CLUB_LEADER, Role.STUDENT],
  },
  {
    to: ROUTES.ADMIN_SETTINGS,
    label: "Paramètres",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 3v2.5M11 16.5v2.5M3 11h2.5M16.5 11H19M5.2 5.2l1.8 1.8M15 15l1.8 1.8M5.2 16.8l1.8-1.8M15 7l1.8-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    roles: [Role.SUPER_ADMIN, Role.CLUB_LEADER],
  },
];

export function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), []);
  const toggleCollapse = useCallback(() => setCollapsed((p) => !p), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => closeMobile(), [location.pathname, closeMobile]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") closeMobile(); };
    if (mobileOpen) {
      document.addEventListener("keydown", esc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, closeMobile]);

  const filteredNav = NAV_ITEMS.filter((i) => !i.roles || hasRole(...i.roles));
  const filteredAdmin = ADMIN_ITEMS.filter((i) => !i.roles || hasRole(...i.roles));
  const filteredBottom = BOTTOM_ITEMS.filter((i) => !i.roles || hasRole(...i.roles));

  const renderLinks = (items: NavItem[]) =>
    items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === ROUTES.DASHBOARD}
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles["navLink--active"] : ""}`
        }
        onClick={closeMobile}
        title={collapsed ? item.label : undefined}
      >
        <span className={styles.navIcon}>{item.icon}</span>
        <span className={styles.navLabel}>{item.label}</span>
        {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
      </NavLink>
    ));

  const sidebarClass = [
    styles.sidebar,
    mobileOpen ? styles["sidebar--open"] : "",
    collapsed ? styles["sidebar--collapsed"] : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={styles.layout}>
      {mobileOpen && <div className={styles.overlay} onClick={closeMobile} />}

      <aside className={sidebarClass}>
        {/* Logo — always visible */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#0A5F3A" />
              <path d="M8 10l6-3.5 6 3.5v8a1 1 0 01-1 1H9a1 1 0 01-1-1v-8z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M11.5 21v-5h5v5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoBrand}>ClubHub</span>
            <span className={styles.logoSub}>ISIMGIEN</span>
          </div>
          <button className={styles.sidebarClose} onClick={closeMobile} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className={styles.sidebarNav}>
          <div className={styles.navGroup}>{renderLinks(filteredNav)}</div>

          {filteredAdmin.length > 0 && (
            <div className={styles.navGroup}>
              {!collapsed && <div className={styles.navGroupLabel}>Administration</div>}
              {renderLinks(filteredAdmin)}
            </div>
          )}

          {filteredBottom.length > 0 && (
            <div className={styles.navGroup}>
              {!collapsed && <div className={styles.navGroupLabel}>Général</div>}
              {renderLinks(filteredBottom)}
            </div>
          )}
        </nav>

        {/* User */}
        <div className={styles.sidebarUser}>
          <Avatar
            name={user ? `${user.firstName} ${user.lastName}` : ""}
            size="sm"
          />
          {!collapsed && (
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.firstName} {user?.lastName}</div>
              <div className={styles.userRole}>
                {user?.role === Role.SUPER_ADMIN ? "Super Admin" : user?.role === Role.CLUB_LEADER ? "Club Leader" : "Étudiant"}
              </div>
            </div>
          )}
          {!collapsed && (
            <button className={styles.logoutBtn} onClick={logout} aria-label="Déconnexion" title="Déconnexion">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2M11 11l3-3-3-3M7 8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Content */}
      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.burger} onClick={toggleMobile} aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button className={styles.collapseToggle} onClick={toggleCollapse} aria-label={collapsed ? "Développer le menu" : "Réduire le menu"} title={collapsed ? "Développer" : "Réduire"}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
                <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className={styles.topbarCenter}>
            <div className={styles.searchBar}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input className={styles.searchInput} type="text" placeholder="Rechercher..." />
              <kbd className={styles.searchKbd}>⌘F</kbd>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <button className={styles.topbarBtn} aria-label="Messages">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 11.5a1.5 1.5 0 01-1.5 1.5H5L2 16V4.5A1.5 1.5 0 013.5 3h11A1.5 1.5 0 0116 4.5V11.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </button>

            <NavLink to={ROUTES.NOTIFICATIONS} className={({ isActive }) => `${styles.topbarBtn} ${isActive ? styles["topbarBtn--active"] : ""}`} aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 6.5a4.5 4.5 0 10-9 0c0 5-2 6.5-2 6.5h13s-2-1.5-2-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.3 15a1.5 1.5 0 01-2.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className={styles.notifDot} />
            </NavLink>

            <div className={styles.topbarDivider} />

            <div className={styles.topbarProfile}>
              <Avatar name={user ? `${user.firstName} ${user.lastName}` : ""} size="xs" />
              <div className={styles.topbarProfileInfo}>
                <span className={styles.topbarProfileName}>{user?.firstName} {user?.lastName}</span>
                <span className={styles.topbarProfileEmail}>{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
