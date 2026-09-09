import { Link } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { Button, Card } from "../components/ui";
import { Stack } from "../components/layout";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.badge}>Plateforme de gestion des clubs</div>
        <h1 className={styles.title}>
          ISIMGIEN
        </h1>
        <p className={styles.subtitle}>
          Manage your club activities, trainings, events, and memberships — all in one place.
        </p>
        <Stack direction="horizontal" gap="md" justify="center">
          <Link to={ROUTES.LOGIN}>
            <Button size="lg">Get Started</Button>
          </Link>
        </Stack>
      </div>

      <div className={styles.features}>
        <div className={styles.featureGrid}>
          <Card padding="lg">
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Club Management</h3>
            <p className={styles.featureDescription}>
              Manage members, track memberships, and organize your club activities.
            </p>
          </Card>

          <Card padding="lg">
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Events & Trainings</h3>
            <p className={styles.featureDescription}>
              Schedule events, manage registrations, and track attendance.
            </p>
          </Card>

          <Card padding="lg">
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Finance Tracking</h3>
            <p className={styles.featureDescription}>
              Track income, expenses, and maintain financial transparency.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
