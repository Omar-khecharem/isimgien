import { useState } from "react";
import { useAllEvents, useRegisterEvent, useCancelRegistration, type UnifiedItem } from "../../features/student";
import styles from "./StudentEventsPage.module.css";

type Filter = "all" | "event" | "training";

export function StudentEventsPage() {
  const { data: items } = useAllEvents();
  const register = useRegisterEvent();
  const cancel = useCancelRegistration();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const filtered = (items ?? []).filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.clubName.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.kind === filter;
    return matchSearch && matchFilter;
  });

  const now = new Date();
  const upcoming = filtered.filter((i) => new Date(i.date) >= now);
  const past = filtered.filter((i) => new Date(i.date) < now);

  const handleAction = async (item: UnifiedItem, action: "register" | "cancel") => {
    setActionId(item._id);
    try {
      if (action === "register") {
        await register.mutateAsync(item);
      } else {
        await cancel.mutateAsync(item);
      }
    } catch {
    } finally {
      setActionId(null);
    }
  };

  const getStatusInfo = (item: UnifiedItem) => {
    const d = new Date(item.date);
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Passé", variant: "gray" as const };
    if (diffDays === 0) return { label: "Aujourd'hui", variant: "red" as const };
    if (diffDays === 1) return { label: "Demain", variant: "orange" as const };
    if (diffDays <= 7) return { label: `Dans ${diffDays}j`, variant: "green" as const };
    return { label: `Dans ${diffDays}j`, variant: "blue" as const };
  };

  const canRegister = (item: UnifiedItem) => {
    return (
      item.status !== "cancelled" &&
      item.status !== "completed" &&
      item.status !== "in_progress" &&
      new Date(item.date) >= now
    );
  };

  const isFull = (item: UnifiedItem) => {
    return item.capacity !== null && item.registeredCount >= item.capacity;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Événements & Formations</h1>
          <p className={styles.subtitle}>
            Découvrez les prochains événements et formations de vos clubs.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
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
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")} aria-label="Effacer">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div className={styles.tabs}>
          {([
            ["all", "Tout"],
            ["event", "Événements"],
            ["training", "Formations"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.tab} ${filter === key ? styles["tab--active"] : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>À venir</h2>
          <div className={styles.grid}>
            {upcoming.map((item) => (
              <EventCard
                key={item._id}
                item={item}
                statusInfo={getStatusInfo(item)}
                canRegister={canRegister(item)}
                isFull={isFull(item)}
                onRegister={() => handleAction(item, "register")}
                onCancel={() => handleAction(item, "cancel")}
                acting={actionId === item._id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Passés</h2>
          <div className={styles.grid}>
            {past.map((item) => (
              <EventCard
                key={item._id}
                item={item}
                statusInfo={getStatusInfo(item)}
                canRegister={false}
                isFull={false}
                onRegister={() => {}}
                onCancel={() => {}}
                acting={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty */}
      {filtered.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 8.5h18" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 2.5v3.5M17 2.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Aucun événement trouvé</p>
          <p className={styles.emptyDesc}>
            {search ? "Essayez avec un autre terme." : "Aucun événement n'est prévu pour le moment."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EventCard
   ═══════════════════════════════════════════════════════════════════════════ */

function EventCard({
  item,
  statusInfo,
  canRegister,
  isFull,
  onRegister,
  onCancel,
  acting,
}: {
  item: UnifiedItem;
  statusInfo: { label: string; variant: "gray" | "red" | "orange" | "green" | "blue" };
  canRegister: boolean;
  isFull: boolean;
  onRegister: () => void;
  onCancel: () => void;
  acting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);

  const d = new Date(item.date);
  const dayNum = d.getDate();
  const monthStr = d.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase();
  const weekdayStr = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const dateFormatted = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const spotsLeft =
    item.capacity !== null ? item.capacity - item.registeredCount : null;

  return (
    <div className={`${styles.card} ${expanded ? styles["card--expanded"] : ""}`}>
      {/* Poster */}
      {item.poster && (
        <div className={styles.cardPoster} onClick={() => setPosterOpen(true)}>
          <img src={item.poster} alt={item.title} />
          <div className={styles.cardPosterOverlay} />
          <div className={styles.cardPosterZoom}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </div>
        </div>
      )}

      {/* Poster Modal */}
      {posterOpen && (
        <div className={styles.posterModal} onClick={() => setPosterOpen(false)}>
          <div className={styles.posterModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.posterModalClose} onClick={() => setPosterOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <img src={item.poster} alt={item.title} className={styles.posterModalImg} />
            <div className={styles.posterModalInfo}>
              <span className={`${styles.kindBadge} ${styles[`kindBadge--${item.kind}`]}`}>
                {item.kind === "training" ? "Formation" : "Événement"}
              </span>
              <h3 className={styles.posterModalTitle}>{item.title}</h3>
              <p className={styles.posterModalDate}>{dateFormatted}</p>
            </div>
          </div>
        </div>
      )}

      {/* Date badge */}
      <div className={styles.cardDate}>
        <span className={styles.cardDay}>{dayNum}</span>
        <span className={styles.cardMonth}>{monthStr}</span>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.cardRow1}>
          <div className={styles.cardBadges}>
            <span className={`${styles.kindBadge} ${styles[`kindBadge--${item.kind}`]}`}>
              {item.kind === "training" ? "Formation" : "Événement"}
            </span>
            <span className={`${styles.timeBadge} ${styles[`timeBadge--${statusInfo.variant}`]}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <h3 className={styles.cardTitle}>{item.title}</h3>

        {item.clubName && (
          <div className={styles.clubInfo}>
            {item.clubLogo && (
              <img src={item.clubLogo} alt="" className={styles.clubLogo} />
            )}
            <span className={styles.clubName}>{item.clubName}</span>
          </div>
        )}

        <div className={styles.cardMeta}>
          <span className={styles.cardMetaItem}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 5h10" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {dateFormatted}
          </span>
          <span className={styles.cardMetaItem}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {item.startTime} — {item.endTime}
          </span>
          <span className={styles.cardMetaItem}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5a4 4 0 014 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {item.location}
          </span>
        </div>

        {/* Capacity bar */}
        {item.capacity !== null && (
          <div className={styles.capacity}>
            <div className={styles.capacityBar}>
              <div
                className={`${styles.capacityFill} ${
                  item.registeredCount >= item.capacity ? styles["capacityFill--full"] : ""
                }`}
                style={{
                  width: `${Math.min((item.registeredCount / item.capacity) * 100, 100)}%`,
                }}
              />
            </div>
            <div className={styles.capacityInfo}>
              <span className={styles.capacityText}>
                {item.registeredCount}/{item.capacity} inscrits
              </span>
              {spotsLeft !== null && spotsLeft > 0 && (
                <span className={styles.capacityLeft}>{spotsLeft} place{spotsLeft > 1 ? "s" : ""} restante{spotsLeft > 1 ? "s" : ""}</span>
              )}
              {spotsLeft !== null && spotsLeft <= 0 && (
                <span className={styles.capacityFull}>Complet</span>
              )}
            </div>
          </div>
        )}

        {/* Description expandable */}
        {item.description && (
          <div className={styles.descWrap}>
            <p className={`${styles.cardDesc} ${expanded ? styles["cardDesc--open"] : ""}`}>
              {item.description}
            </p>
            {item.description.length > 120 && (
              <button className={styles.descToggle} onClick={() => setExpanded(!expanded)}>
                {expanded ? "Voir moins" : "Lire la suite"}
              </button>
            )}
          </div>
        )}

        {/* Action */}
        {canRegister && (
          <div className={styles.cardActions}>
            {isFull ? (
              <span className={styles.fullBadge}>Complet</span>
            ) : (
              <button
                className={styles.registerBtn}
                onClick={onRegister}
                disabled={acting}
              >
                {acting ? (
                  "Inscription..."
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    S'inscrire
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
