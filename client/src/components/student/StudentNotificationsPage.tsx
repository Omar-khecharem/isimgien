import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "../../features/notifications/notificationsService";
import styles from "./StudentNotificationsPage.module.css";

export function StudentNotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student", "notifications"],
    queryFn: async () => {
      const res = await notificationsService.getGlobalSummary();
      return res.data;
    },
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>
            Restez informé des dernières actualités et événements.
          </p>
        </div>
        {data && data.unread > 0 && (
          <span className={styles.unreadBadge}>{data.unread} non lues</span>
        )}
      </header>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.loadingDot} />
          <div className={styles.loadingDot} />
          <div className={styles.loadingDot} />
        </div>
      ) : data && data.recent.length > 0 ? (
        <div className={styles.list}>
          {data.recent.map((n) => (
            <NotificationCard key={n._id} notification={n} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Aucune notification</p>
          <p className={styles.emptyDesc}>
            Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.
          </p>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
}: {
  notification: {
    _id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  };
}) {
  const typeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    event: {
      color: "#059669",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 6h12" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 1.5v2.5M11 1.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    training: {
      color: "#1d4ed8",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 6h12" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 1.5v2.5M11 1.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    membership: {
      color: "#7c3aed",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    default: {
      color: "#6b7280",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 6.5a4.5 4.5 0 10-9 0c0 5-2 6.5-2 6.5h13s-2-1.5-2-6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.3 13.5a1.5 1.5 0 01-2.6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
  };

  const config = typeConfig[notification.type] || typeConfig.default;

  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div className={styles.card}>
      <div className={styles.cardIcon} style={{ color: config.color, background: `${config.color}10` }}>
        {config.icon}
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{notification.title}</h3>
          <span className={styles.cardTime}>{timeAgo}</span>
        </div>
        <p className={styles.cardMessage}>{notification.message}</p>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
