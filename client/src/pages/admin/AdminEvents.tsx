import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService, type Event, EventStatus } from "../../features/events/eventsService";
import styles from "./AdminEvents.module.css";

const STATUS_LABELS: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: "Brouillon",
  [EventStatus.PUBLISHED]: "Publié",
  [EventStatus.REGISTRATION_OPEN]: "Inscriptions ouvertes",
  [EventStatus.REGISTRATION_CLOSED]: "Inscriptions fermées",
  [EventStatus.IN_PROGRESS]: "En cours",
  [EventStatus.COMPLETED]: "Terminé",
  [EventStatus.CANCELLED]: "Annulé",
};

const STATUS_COLORS: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: "gray",
  [EventStatus.PUBLISHED]: "blue",
  [EventStatus.REGISTRATION_OPEN]: "green",
  [EventStatus.REGISTRATION_CLOSED]: "amber",
  [EventStatus.IN_PROGRESS]: "purple",
  [EventStatus.COMPLETED]: "emerald",
  [EventStatus.CANCELLED]: "red",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getClubName(club: Event["club"]): string {
  if (typeof club === "object" && club !== null && "name" in club) {
    return (club as { name: string }).name;
  }
  return "Club inconnu";
}

function getClubLogo(club: Event["club"]): string | null {
  if (typeof club === "object" && club !== null && "logo" in club) {
    return (club as { logo?: string }).logo || null;
  }
  return null;
}

const AVATAR_COLORS = ["#059669", "#3B82F6", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];

function getClubColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function AdminEvents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "events", { page, search, statusFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      return eventsService.listAll(params as any);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => {
      const event = allEvents.find((e) => e._id === eventId);
      const clubId = typeof event?.club === "object" ? event.club._id : event?.club;
      return eventsService.delete(clubId!, eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: EventStatus }) => {
      const event = allEvents.find((e) => e._id === eventId);
      const clubId = typeof event?.club === "object" ? event.club._id : event?.club;
      return eventsService.transitionStatus(clubId!, eventId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });

  const allEvents: Event[] = data?.data || [];
  const meta = data?.meta;

  const draftCount = allEvents.filter((e) => e.status === EventStatus.DRAFT).length;
  const publishedCount = allEvents.filter((e) =>
    [EventStatus.PUBLISHED, EventStatus.REGISTRATION_OPEN, EventStatus.REGISTRATION_CLOSED].includes(e.status)
  ).length;
  const ongoingCount = allEvents.filter((e) => e.status === EventStatus.IN_PROGRESS).length;
  const completedCount = allEvents.filter((e) => e.status === EventStatus.COMPLETED).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Événements</h1>
          <p className={styles.subtitle}>Gérez tous les événements de la plateforme</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statCards}>
        <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
          <div className={styles.statCardBg} />
          <div className={styles.statCardInner}>
            <div className={styles.statCardIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 9h16" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.statCardContent}>
              <span className={styles.statCardValue}>{meta?.total || 0}</span>
              <span className={styles.statCardLabel}>Total</span>
            </div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--draft"]}`}>
          <div className={styles.statCardBg} />
          <div className={styles.statCardInner}>
            <div className={styles.statCardIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M14 3H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M14 3v5h5M8 13h6M8 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.statCardContent}>
              <span className={styles.statCardValue}>{draftCount}</span>
              <span className={styles.statCardLabel}>Brouillons</span>
            </div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--active"]}`}>
          <div className={styles.statCardBg} />
          <div className={styles.statCardInner}>
            <div className={styles.statCardIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.statCardContent}>
              <span className={styles.statCardValue}>{publishedCount}</span>
              <span className={styles.statCardLabel}>Actifs</span>
            </div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--ongoing"]}`}>
          <div className={styles.statCardBg} />
          <div className={styles.statCardInner}>
            <div className={styles.statCardIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.statCardContent}>
              <span className={styles.statCardValue}>{ongoingCount}</span>
              <span className={styles.statCardLabel}>En cours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Rechercher un événement..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${statusFilter === "" ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(""); setPage(1); }}
          >
            Tous
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === EventStatus.DRAFT ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(EventStatus.DRAFT); setPage(1); }}
          >
            Brouillons
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === EventStatus.REGISTRATION_OPEN ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(EventStatus.REGISTRATION_OPEN); setPage(1); }}
          >
            Inscriptions ouvertes
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === EventStatus.IN_PROGRESS ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(EventStatus.IN_PROGRESS); setPage(1); }}
          >
            En cours
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === EventStatus.COMPLETED ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(EventStatus.COMPLETED); setPage(1); }}
          >
            Terminés
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === EventStatus.CANCELLED ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(EventStatus.CANCELLED); setPage(1); }}
          >
            Annulés
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className={styles.eventsSection}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Chargement des événements...</span>
          </div>
        ) : allEvents.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>Aucun événement trouvé</p>
            <p className={styles.emptyDesc}>
              {search ? "Essayez avec d'autres termes de recherche" : "Aucun événement n'a encore été créé"}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.eventsGrid}>
              {allEvents.map((event) => {
                const clubName = getClubName(event.club);
                const clubLogo = getClubLogo(event.club);
                const clubColor = getClubColor(clubName);
                const statusColor = STATUS_COLORS[event.status];
                return (
                  <div key={event._id} className={styles.eventCard}>
                    <div className={styles.eventCardHeader}>
                      <div className={styles.clubBadge}>
                        {clubLogo ? (
                          <img src={clubLogo} alt="" className={styles.clubBadgeImg} />
                        ) : (
                          <div className={styles.clubBadgeIcon} style={{ background: `${clubColor}12`, color: clubColor }}>
                            {clubName.charAt(0)}
                          </div>
                        )}
                        <span className={styles.clubBadgeName}>{clubName}</span>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[`status--${statusColor}`]}`}>
                        {STATUS_LABELS[event.status]}
                      </span>
                    </div>

                    <h3 className={styles.eventTitle}>{event.title}</h3>

                    <div className={styles.eventMeta}>
                      <div className={styles.eventMetaItem}>
                        <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                          <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M3 9h16" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M8 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                          <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M11 6v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{event.startTime} — {event.endTime}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                          <path d="M11 2C7.13 2 4 5.13 4 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="11" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className={styles.eventFooter}>
                      <div className={styles.capacityInfo}>
                        <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                          <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M4 20c0-3 2.5-5.5 5-5.5s5 2.5 5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>
                          {event.registeredCount}
                          {event.capacity ? ` / ${event.capacity}` : ""} inscrits
                        </span>
                      </div>
                      <div className={styles.eventActions}>
                        {event.status === EventStatus.DRAFT && (
                          <button
                            className={`${styles.actionBtn} ${styles["actionBtn--publish"]}`}
                            onClick={() => statusMutation.mutate({ eventId: event._id, status: EventStatus.PUBLISHED })}
                            disabled={statusMutation.isPending}
                            title="Publier"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                        {event.status !== EventStatus.CANCELLED && event.status !== EventStatus.COMPLETED && (
                          <button
                            className={`${styles.actionBtn} ${styles["actionBtn--cancel"]}`}
                            onClick={() => statusMutation.mutate({ eventId: event._id, status: EventStatus.CANCELLED })}
                            disabled={statusMutation.isPending}
                            title="Annuler"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                        <button
                          className={`${styles.actionBtn} ${styles["actionBtn--delete"]}`}
                          onClick={() => {
                            if (confirm("Supprimer cet événement ?")) {
                              deleteMutation.mutate(event._id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          title="Supprimer"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M6 6.5v3M8 6.5v3M3 4l.7 8a1 1 0 001 .9h4.6a1 1 0 001-.9L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Page {page} sur {meta.totalPages} · {meta.total} événements
                </span>
                <div className={styles.paginationBtns}>
                  <button
                    className={styles.pageBtn}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`${styles.pageNum} ${page === pageNum ? styles["pageNum--active"] : ""}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    className={styles.pageBtn}
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
