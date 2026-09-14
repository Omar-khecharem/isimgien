import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsService, type Club } from "../../features/clubs/clubsService";
import styles from "./AdminClubs.module.css";

const AVATAR_COLORS = ["#059669", "#3B82F6", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];

function getClubColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLeaderName(leader: Club["leader"]): string {
  if (typeof leader === "object" && leader !== null && "firstName" in leader) {
    return `${(leader as any).firstName} ${(leader as any).lastName}`;
  }
  return "Non assigné";
}

function getLeaderEmail(leader: Club["leader"]): string | null {
  if (typeof leader === "object" && leader !== null && "email" in leader) {
    return (leader as any).email;
  }
  return null;
}

function getLeaderInitials(leader: Club["leader"]): string {
  if (typeof leader === "object" && leader !== null && "firstName" in leader) {
    const l = leader as any;
    return `${l.firstName?.charAt(0) || ""}${l.lastName?.charAt(0) || ""}`.toUpperCase();
  }
  return "?";
}

export function AdminClubs() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "clubs", { page, search, statusFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.search = search;
      if (statusFilter === "active") params.isActive = true;
      if (statusFilter === "inactive") params.isActive = false;
      return clubsService.list(params as any);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (clubId: string) => clubsService.deactivate(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: Partial<Club> }) =>
      clubsService.update(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (clubId: string) => clubsService.deactivate(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] });
    },
  });

  const allClubs: Club[] = data?.data || [];
  const meta = data?.meta;

  const activeCount = allClubs.filter((c) => c.isActive).length;
  const inactiveCount = allClubs.filter((c) => !c.isActive).length;
  const withLeaderCount = allClubs.filter((c) => c.leader).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Clubs</h1>
          <p className={styles.subtitle}>Gérez tous les clubs de la plateforme</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statCards}>
        <div className={`${styles.statCard} ${styles["statCard--total"]}`}>
          <div className={styles.statCardBg} />
          <div className={styles.statCardInner}>
            <div className={styles.statCardIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 10.5C3 6.5 6 3.5 11 3.5s8 3 8 7c0 2-1 4-3 5l-1 2H5l-1-2c-1.5-1.2-2.5-3-1-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="7.5" cy="12" r="1" fill="currentColor" />
                <circle cx="11" cy="12" r="1" fill="currentColor" />
                <circle cx="14.5" cy="12" r="1" fill="currentColor" />
                <path d="M8 18c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.statCardContent}>
              <span className={styles.statCardValue}>{meta?.total || 0}</span>
              <span className={styles.statCardLabel}>Total clubs</span>
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
              <span className={styles.statCardValue}>{activeCount}</span>
              <span className={styles.statCardLabel}>Actifs</span>
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
              <span className={styles.statCardValue}>{inactiveCount}</span>
              <span className={styles.statCardLabel}>Inactifs</span>
            </div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--leader"]}`}>
          <div className={styles.statCardBg} />
          <div className={styles.statCardInner}>
            <div className={styles.statCardIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.statCardContent}>
              <span className={styles.statCardValue}>{withLeaderCount}</span>
              <span className={styles.statCardLabel}>Avec leader</span>
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
            placeholder="Rechercher un club..."
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
            className={`${styles.filterTab} ${statusFilter === "all" ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter("all"); setPage(1); }}
          >
            Tous
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === "active" ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter("active"); setPage(1); }}
          >
            Actifs
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === "inactive" ? styles["filterTab--active"] : ""}`}
            onClick={() => { setStatusFilter("inactive"); setPage(1); }}
          >
            Inactifs
          </button>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className={styles.clubsSection}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Chargement des clubs...</span>
          </div>
        ) : allClubs.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M3 10.5C3 6.5 6 3.5 11 3.5s8 3 8 7c0 2-1 4-3 5l-1 2H5l-1-2c-1.5-1.2-2.5-3-1-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="7.5" cy="12" r="1" fill="currentColor" />
                <circle cx="11" cy="12" r="1" fill="currentColor" />
                <circle cx="14.5" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>Aucun club trouvé</p>
            <p className={styles.emptyDesc}>
              {search ? "Essayez avec d'autres termes de recherche" : "Aucun club n'a encore été créé"}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.clubsGrid}>
              {allClubs.map((club) => {
                const clubColor = getClubColor(club.name);
                const leaderName = getLeaderName(club.leader);
                const leaderEmail = getLeaderEmail(club.leader);
                const leaderInitials = getLeaderInitials(club.leader);
                const leaderColor = getClubColor(leaderName);

                return (
                  <div key={club._id} className={styles.clubCard}>
                    {/* Cover */}
                    <div className={styles.clubCover}>
                      {club.coverImage ? (
                        <img src={club.coverImage} alt="" className={styles.clubCoverImg} />
                      ) : (
                        <div
                          className={styles.clubCoverFallback}
                          style={{
                            background: `linear-gradient(135deg, ${clubColor}18, ${clubColor}08)`,
                          }}
                        >
                          <div className={styles.clubCoverPattern} style={{ color: `${clubColor}15` }}>
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                              <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="2" />
                              <circle cx="40" cy="40" r="18" stroke="currentColor" strokeWidth="1.5" />
                              <circle cx="40" cy="40" r="6" fill="currentColor" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className={styles.clubStatusBadge}>
                        <span
                          className={`${styles.statusDot} ${club.isActive ? styles["statusDot--active"] : ""}`}
                        />
                        {club.isActive ? "Actif" : "Inactif"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={styles.clubContent}>
                      <div className={styles.clubHeader}>
                        {club.logo ? (
                          <img src={club.logo} alt="" className={styles.clubLogo} />
                        ) : (
                          <div
                            className={styles.clubLogoFallback}
                            style={{ background: `${clubColor}12`, color: clubColor }}
                          >
                            {club.name.charAt(0)}
                          </div>
                        )}
                        <div className={styles.clubTitleWrap}>
                          <h3 className={styles.clubName}>{club.name}</h3>
                          {club.establishedDate && (
                            <span className={styles.clubDate}>
                              Depuis {formatDate(club.establishedDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className={styles.clubDesc}>
                        {club.description || "Aucune description"}
                      </p>

                      {/* Leader */}
                      <div className={styles.leaderRow}>
                        <div className={styles.leaderAvatar} style={{ background: `${leaderColor}12`, color: leaderColor, borderColor: `${leaderColor}25` }}>
                          {leaderInitials}
                        </div>
                        <div className={styles.leaderInfo}>
                          <span className={styles.leaderName}>{leaderName}</span>
                          {leaderEmail && (
                            <span className={styles.leaderEmail}>{leaderEmail}</span>
                          )}
                        </div>
                      </div>

                      {/* Meta */}
                      <div className={styles.clubMeta}>
                        {club.contactEmail && (
                          <div className={styles.metaItem}>
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                              <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M2 6l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            <span>{club.contactEmail}</span>
                          </div>
                        )}
                        {club.settings.membershipFee > 0 && (
                          <div className={styles.metaItem}>
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M10 6v8M7.5 8h5M7.5 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                            <span>{club.settings.membershipFee} DA</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.clubActions}>
                      {club.isActive ? (
                        <button
                          className={`${styles.actionBtn} ${styles["actionBtn--deactivate"]}`}
                          onClick={() => deactivateMutation.mutate(club._id)}
                          disabled={deactivateMutation.isPending}
                          title="Désactiver"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M4 7h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                          </svg>
                          <span>Désactiver</span>
                        </button>
                      ) : (
                        <button
                          className={`${styles.actionBtn} ${styles["actionBtn--activate"]}`}
                          onClick={() => activateMutation.mutate({ clubId: club._id, data: { isActive: true } })}
                          disabled={activateMutation.isPending}
                          title="Activer"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M5 7l1.5 1.5L9 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>Activer</span>
                        </button>
                      )}
                      <button
                        className={`${styles.actionBtn} ${styles["actionBtn--delete"]}`}
                        onClick={() => {
                          if (confirm(`Supprimer le club "${club.name}" ? Cette action est irréversible.`)) {
                            deleteMutation.mutate(club._id);
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
                );
              })}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  Page {page} sur {meta.totalPages} · {meta.total} clubs
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
