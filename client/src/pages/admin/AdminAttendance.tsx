import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService, AttendanceStatus, type GlobalAttendanceRecord } from "../../features/attendance/attendanceService";
import { clubsService, type Club } from "../../features/clubs/clubsService";
import styles from "./AdminAttendance.module.css";

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string }> = {
  [AttendanceStatus.CHECKED_IN]: { label: "Présent", color: "green" },
  [AttendanceStatus.CHECKED_OUT]: { label: "Terminé", color: "emerald" },
  [AttendanceStatus.NOT_ATTENDED]: { label: "Non marqué", color: "gray" },
  [AttendanceStatus.ABSENT]: { label: "Absent", color: "red" },
  [AttendanceStatus.INCOMPLETE]: { label: "Incomplet", color: "amber" },
};

const AVATAR_COLORS = ["#059669", "#3B82F6", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  return formatDate(dateStr);
}

export function AdminAttendance() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [clubFilter, setClubFilter] = useState("");
  const [page, setPage] = useState(1);

  // ── Fetch clubs for filter ─────────────────────────────────────────────
  const { data: clubsData } = useQuery({
    queryKey: ["admin", "all-clubs-attendance"],
    queryFn: async () => clubsService.list({ limit: 100 }),
  });

  const allClubs: Club[] = clubsData?.data || [];

  // ── Fetch global attendance ────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "global-attendance", { page, search, statusFilter, clubFilter }],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (clubFilter) params.clubId = clubFilter;
      return attendanceService.getGlobalAttendance(params);
    },
  });

  const allRecords: GlobalAttendanceRecord[] = data?.data || [];
  const meta = data?.meta;

  // ── Client-side computed stats (based on current page) ─────────────────
  const checkedInCount = allRecords.filter((r) => r.status === AttendanceStatus.CHECKED_IN).length;
  const checkedOutCount = allRecords.filter((r) => r.status === AttendanceStatus.CHECKED_OUT).length;
  const absentCount = allRecords.filter((r) => r.status === AttendanceStatus.ABSENT).length;
  const incompleteCount = allRecords.filter((r) => r.status === AttendanceStatus.INCOMPLETE).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Présence Globale</h1>
          <p className={styles.subtitle}>Suivi de la présence de tous les clubs</p>
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
              <span className={styles.statCardLabel}>Total présences</span>
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
              <span className={styles.statCardValue}>{checkedInCount}</span>
              <span className={styles.statCardLabel}>Présents</span>
            </div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--inactive"]}`}>
          <div className={styles.statCardBg} />
          <div className={styles.statCardInner}>
            <div className={styles.statCardIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.statCardContent}>
              <span className={styles.statCardValue}>{absentCount}</span>
              <span className={styles.statCardLabel}>Absents</span>
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
              <span className={styles.statCardValue}>{incompleteCount}</span>
              <span className={styles.statCardLabel}>Incomplets</span>
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
            placeholder="Rechercher un étudiant..."
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
        <div className={styles.clubFilterWrap}>
          <svg className={styles.clubFilterIcon} width="16" height="16" viewBox="0 0 22 22" fill="none">
            <path d="M3 10.5C3 6.5 6 3.5 11 3.5s8 3 8 7c0 2-1 4-3 5l-1 2H5l-1-2c-1.5-1.2-2.5-3-1-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <select
            className={styles.clubFilter}
            value={clubFilter}
            onChange={(e) => { setClubFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tous les clubs</option>
            {allClubs.map((club) => (
              <option key={club._id} value={club._id}>{club.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${statusFilter === "" ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(""); setPage(1); }}
          >
            Tous
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === AttendanceStatus.CHECKED_IN ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(AttendanceStatus.CHECKED_IN); setPage(1); }}
          >
            Présents
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === AttendanceStatus.CHECKED_OUT ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(AttendanceStatus.CHECKED_OUT); setPage(1); }}
          >
            Terminés
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === AttendanceStatus.ABSENT ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(AttendanceStatus.ABSENT); setPage(1); }}
          >
            Absents
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === AttendanceStatus.INCOMPLETE ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter(AttendanceStatus.INCOMPLETE); setPage(1); }}
          >
            Incomplets
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Chargement des présences...</span>
          </div>
        ) : allRecords.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>Aucune présence trouvée</p>
            <p className={styles.emptyDesc}>
              {search || statusFilter || clubFilter
                ? "Essayez de modifier vos filtres"
                : "Aucun enregistrement de présence n'existe encore"}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Club</th>
                    <th>Formation</th>
                    <th>Arrivée</th>
                    <th>Départ</th>
                    <th>Statut</th>
                    <th>Méthode</th>
                  </tr>
                </thead>
                <tbody>
                  {allRecords.map((record) => {
                    const fullName = `${record.user.firstName} ${record.user.lastName}`;
                    const avatarColor = getAvatarColor(fullName);
                    const statusCfg = STATUS_CONFIG[record.status];
                    const clubName = record.training?.club?.name || "—";
                    return (
                      <tr key={record._id} className={styles.row}>
                        <td>
                          <div className={styles.userCell}>
                            <div
                              className={styles.avatar}
                              style={{ background: `${avatarColor}12`, color: avatarColor, borderColor: `${avatarColor}25` }}
                            >
                              {record.user.avatar ? (
                                <img src={record.user.avatar} alt="" className={styles.avatarImg} />
                              ) : (
                                <span>{getInitials(record.user.firstName, record.user.lastName)}</span>
                              )}
                            </div>
                            <div className={styles.userInfo}>
                              <span className={styles.userName}>{fullName}</span>
                              <span className={styles.userEmail}>{record.user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.clubCell}>
                            <div
                              className={styles.clubDot}
                              style={{ background: getAvatarColor(clubName) }}
                            />
                            <span className={styles.clubName}>{clubName}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.trainingCell}>
                            <span className={styles.trainingTitle}>{record.training?.title || "—"}</span>
                            <span className={styles.trainingDate}>{record.training?.date ? formatDate(record.training.date) : "—"}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.timeCell}>
                            {formatDateTime(record.checkIn?.time)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.timeCell}>
                            {formatDateTime(record.checkOut?.time)}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[`status--${statusCfg.color}`]}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td>
                          <span className={styles.methodBadge}>
                            {record.checkIn?.method === "qr_code" ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                  <rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
                                  <rect x="9" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
                                  <rect x="1" y="9" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
                                  <rect x="9" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
                                  <rect x="12" y="12" width="1" height="1" rx="0.5" fill="currentColor" />
                                </svg>
                                QR
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                  <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                                  <path d="M2.5 13c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                </svg>
                                Manuel
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Page {page} sur {meta.totalPages} · {meta.total} enregistrements
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
