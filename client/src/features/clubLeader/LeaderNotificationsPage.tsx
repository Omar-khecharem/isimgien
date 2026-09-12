import { useState } from "react";
import styles from "./LeaderNotificationsPage.module.css";

/* ─── Types ──────────────────────────────────────────────────────────── */

type NotifType = "member" | "training" | "form" | "finance" | "alert";
type NotifFilter = "all" | "unread" | "today";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  category: string;
}

/* ─── Mock Data ──────────────────────────────────────────────────────── */

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "member",
    title: "Nouvelle inscription",
    message: "Ahmed Benali a rejoint le club. En attente de validation de sa cotisation.",
    time: "Il y a 12 min",
    unread: true,
    category: "Membres",
  },
  {
    id: "2",
    type: "training",
    title: "Formation terminée",
    message: "Initiation à la photographie — 18 présents sur 20 inscrits. Taux de présence : 90%.",
    time: "Il y a 2h",
    unread: true,
    category: "Formations",
  },
  {
    id: "3",
    type: "finance",
    title: "Paiement reçu",
    message: "Cotisation de Sarah Meziane — 2 000 TND enregistrée avec succès.",
    time: "Il y a 3h",
    unread: true,
    category: "Caisse",
  },
  {
    id: "4",
    type: "form",
    title: "Formulaire soumis",
    message: "3 nouvelles réponses au formulaire d'inscription au workshop Design Graphique.",
    time: "Il y a 5h",
    unread: false,
    category: "Formulaires",
  },
  {
    id: "5",
    type: "training",
    title: "Formation planifiée",
    message: "Workshop Design Graphique confirmé pour le 15 Septembre. 12 inscrits.",
    time: "Hier",
    unread: false,
    category: "Formations",
  },
  {
    id: "6",
    type: "alert",
    title: "Capacité atteinte",
    message: "La formation 'Atelier Photo Avancée' a atteint sa capacité maximale (20/20).",
    time: "Hier",
    unread: false,
    category: "Alertes",
  },
  {
    id: "7",
    type: "member",
    title: "Demande d'adhésion",
    message: "Youssef Trabelsi a demandé à rejoindre le club. En attente de votre validation.",
    time: "Il y a 2 jours",
    unread: false,
    category: "Membres",
  },
  {
    id: "8",
    type: "finance",
    title: "Rappel de cotisation",
    message: "3 membres n'ont pas encore payé leur cotisation trimestrielle.",
    time: "Il y a 3 jours",
    unread: false,
    category: "Caisse",
  },
];

const TYPE_ICONS: Record<NotifType, React.ReactNode> = {
  member: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  training: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  form: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </svg>
  ),
  finance: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  alert: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function LeaderNotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotifFilter>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const todayCount = notifications.filter((n) =>
    n.time.includes("min") || n.time.includes("h")
  ).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread" && !n.unread) return false;
    if (filter === "today" && !n.time.includes("min") && !n.time.includes("h")) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    showToast("Marquée comme lue");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("Toutes marquées comme lues");
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast("Notification supprimée");
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.greeting}>Notifications</h1>
          <p className={styles.subtitle}>{unreadCount} non lue(s) · {notifications.length} au total</p>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles["btn--ghost"]}`} onClick={markAllRead}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
            Tout marquer lu
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--unread"]}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{unreadCount}</div>
            <div className={styles.statLabel}>Non lues</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--today"]}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{todayCount}</div>
            <div className={styles.statLabel}>Aujourd'hui</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--total"]}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{notifications.length}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${filter === "all" ? styles["tab--active"] : ""}`} onClick={() => setFilter("all")}>
            Toutes
          </button>
          <button className={`${styles.tab} ${filter === "unread" ? styles["tab--active"] : ""}`} onClick={() => setFilter("unread")}>
            Non lues
            {unreadCount > 0 && <span className={styles.tabBadge}>{unreadCount}</span>}
          </button>
          <button className={`${styles.tab} ${filter === "today" ? styles["tab--active"] : ""}`} onClick={() => setFilter("today")}>
            Aujourd'hui
          </button>
        </div>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          </span>
          <input
            className={styles.searchInput}
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
          </div>
          <h3 className={styles.emptyTitle}>Aucune notification</h3>
          <p className={styles.emptyDesc}>
            {search ? "Aucun résultat pour votre recherche." : "Vous êtes à jour. Aucune notification à afficher."}
          </p>
        </div>
      ) : (
        <div className={styles.notifList}>
          {filtered.map((n) => (
            <div key={n.id} className={`${styles.notifItem} ${n.unread ? styles["notifItem--unread"] : ""}`}>
              <div className={`${styles.notifAvatar} ${styles[`notifAvatar--${n.type}`]}`}>
                {TYPE_ICONS[n.type]}
              </div>
              <div className={styles.notifContent}>
                <div className={styles.notifHeader}>
                  <span className={styles.notifTitle}>{n.title}</span>
                  {n.unread && <span className={`${styles.notifBadge} ${styles["notifBadge--new"]}`}>Nouveau</span>}
                </div>
                <p className={styles.notifMsg}>{n.message}</p>
                <div className={styles.notifMeta}>
                  <span className={styles.notifTime}>{n.time}</span>
                  <span className={styles.notifCategory}>{n.category}</span>
                </div>
              </div>
              <div className={styles.notifActions}>
                {n.unread && (
                  <button
                    className={`${styles.notifActionBtn} ${styles["notifActionBtn--read"]}`}
                    title="Marquer comme lu"
                    onClick={() => markAsRead(n.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                )}
                <button
                  className={`${styles.notifActionBtn} ${styles["notifActionBtn--delete"]}`}
                  title="Supprimer"
                  onClick={() => deleteNotif(n.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
