import { useState } from "react";
import { useAllEvents, type UnifiedItem } from "../../features/student";
import styles from "./StudentEventsPage.module.css";

type Filter = "all" | "event" | "training";

export function StudentPastEventsPage() {
  const { data: items, isLoading } = useAllEvents();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const now = new Date();
  const past = (items ?? []).filter((item) => {
    const d = new Date(item.date);
    const matchPast = d < now;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.clubName.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.kind === filter;
    return matchPast && matchSearch && matchFilter;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Événements passés</h1>
          <p className={styles.subtitle}>{past.length} événement{past.length > 1 ? "s" : ""} passé{past.length > 1 ? "s" : ""}</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Rechercher un événement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {(["all", "event", "training"] as const).map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles["filterBtn--active"] : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tous" : f === "event" ? "Événements" : "Formations"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.loadingDot} />
          <div className={styles.loadingDot} />
          <div className={styles.loadingDot} />
        </div>
      ) : past.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="5" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 11h20" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 3v4M19 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Aucun événement passé</p>
          <p className={styles.emptyDesc}>Les événements terminés apparaîtront ici.</p>
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {past.map((item) => (
            <PastEventCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function PastEventCard({ item }: { item: UnifiedItem }) {
  const d = new Date(item.date);
  const dayNum = d.getDate();
  const monthStr = d.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase();
  const yearStr = d.getFullYear();

  return (
    <div className={styles.pastCard}>
      <div className={styles.pastCardDate}>
        <span className={styles.pastCardDay}>{dayNum}</span>
        <span className={styles.pastCardMonth}>{monthStr}</span>
        <span className={styles.pastCardYear}>{yearStr}</span>
      </div>
      {item.poster && (
        <div className={styles.pastCardPoster}>
          <img src={item.poster} alt="" />
        </div>
      )}
      <div className={styles.pastCardInfo}>
        <div className={styles.pastCardTop}>
          <span className={styles.pastCardTitle}>{item.title}</span>
          <span className={`${styles.tag} ${item.kind === "training" ? styles["tag--blue"] : styles["tag--green"]}`}>
            {item.kind === "training" ? "Formation" : "Événement"}
          </span>
        </div>
        <div className={styles.pastCardMeta}>
          <span>{item.clubName}</span>
          <span>·</span>
          <span>{item.location}</span>
        </div>
        <div className={styles.pastCardTime}>
          {item.startTime} — {item.endTime}
        </div>
      </div>
      <div className={styles.pastCardStatus}>
        <span className={styles.pastBadge}>Terminé</span>
      </div>
    </div>
  );
}
