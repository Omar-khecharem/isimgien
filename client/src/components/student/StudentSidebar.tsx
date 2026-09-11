import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
import { Avatar, Button, Input } from "../ui";
import { Separator } from "../layout";
import { ROUTES } from "../../routes/paths";
import styles from "./StudentSidebar.module.css";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
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
    to: "/student/events",
    label: "Événements & Formations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 6h6M6 9h6M6 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
    label: "Formulaires & Inscriptions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 6h6M6 9h6M6 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: ROUTES.MY_ATTENDANCE,
    label: "Membres & Présences",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    to: "/student/settings",
    label: "Paramètres",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/student/help",
    label: "Aide & Support",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7a2 2 0 112.5 1.9c-.3.1-.5.3-.5.6V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="13" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function StudentSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>ISIMGIEN</span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Input
            placeholder="Rechercher..."
            leftAddon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            className={styles.searchInput}
          />
          <kbd className={styles.shortcut}>⌘K</kbd>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.navSection}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.DASHBOARD}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles["navLink--active"] : ""}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <Separator spacing="lg" />

        {/* Bottom Navigation */}
        <div className={styles.navSection}>
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles["navLink--active"] : ""}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}

          <button className={styles.navLink} onClick={handleLogout}>
            <span className={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M6 3H4a1 1 0 00-1 1v10a1 1 0 001 1h2M12 13l4-4-4-4M7 9h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={styles.navLabel}>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Bottom Card */}
      <div className={styles.bottomCard}>
        <p className={styles.bottomCardTitle}>Accès rapide ISIMGIEN</p>
        <p className={styles.bottomCardText}>
          Consultez vos cotisations et vos attestations de présence.
        </p>
        <Button
          variant="primary"
          size="sm"
          className={styles.bottomCardCta}
          onClick={() => navigate(ROUTES.MY_MEMBERSHIPS)}
        >
          Mon Profil Étudiant
        </Button>
      </div>

      {/* User Profile */}
      <div className={styles.userSection}>
        <Avatar
          src={user?.avatar}
          name={user ? `${user.firstName} ${user.lastName}` : ""}
          size="sm"
        />
        <div className={styles.userInfo}>
          <div className={styles.userName}>
            {user?.firstName} {user?.lastName}
          </div>
          <div className={styles.userEmail}>{user?.email}</div>
        </div>
      </div>
    </div>
  );
}
