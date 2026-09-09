import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth";
import { Button } from "../components/ui";
import { ROUTES } from "../routes/paths";
import styles from "./PublicLayout.module.css";

export function PublicLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          <span className={styles.logoMark}>ISIMGIEN</span>
          <span className={styles.logoText}>ClubHub</span>
        </Link>
        <nav className={styles.nav}>
          {isAuthenticated ? (
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="secondary" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
