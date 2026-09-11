import { useState } from "react";
import { useAuth } from "../../features/auth";
import { clubsService } from "../clubs/clubsService";
import { clubLeaderService, type MemberRecord } from "./clubLeaderService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./LeaderMembersPage.module.css";

/* ─── SVG Icons ───────────────────────────────────────────────────────── */

const I = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  userPlus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>,
  dollar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  clock: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  alert: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  arrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
};

const AVATAR_COLORS = ["green", "blue", "purple", "orange"] as const;
const CURRENT_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(firstName?: string, lastName?: string) {
  return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase() || "?";
}

function getStatusLabel(s: string) {
  if (s === "active") return "Actif";
  if (s === "pending_payment") return "En attente";
  if (s === "expired") return "Expiré";
  return s;
}

/* ─── Component ──────────────────────────────────────────────────────── */

export default function LeaderMembersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const limit = 10;

  /* ── Fetch club ──────────────────────────────────────────────────── */

  const { data: clubData } = useQuery({
    queryKey: ["leader", "my-club"],
    queryFn: async () => (await clubsService.getMyClub()).data,
    enabled: !!user,
  });

  const clubId = clubData?._id;

  /* ── Fetch members ───────────────────────────────────────────────── */

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["leader", "members", clubId, page, statusFilter, search],
    queryFn: async () => {
      if (!clubId) return null;
      const params: Record<string, any> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      return (await clubLeaderService.getMembers(clubId, params)).data;
    },
    enabled: !!clubId,
  });

  /* ── Fetch stats ─────────────────────────────────────────────────── */

  const { data: stats } = useQuery({
    queryKey: ["leader", "member-stats", clubId],
    queryFn: async () => {
      if (!clubId) return null;
      return (await clubLeaderService.getMembershipStats(clubId)).data;
    },
    enabled: !!clubId,
  });

  /* ── Invite mutation ─────────────────────────────────────────────── */

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!clubId || !inviteEmail.trim()) throw new Error("Missing data");
      return clubLeaderService.inviteMember(clubId, {
        userId: inviteEmail.trim(),
        academicYear: CURRENT_YEAR,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "members"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "member-stats"] });
      setShowInvite(false);
      setInviteEmail("");
      setToast("Membre invité avec succès");
      setTimeout(() => setToast(null), 3000);
    },
  });

  /* ── Status update mutation ───────────────────────────────────────── */

  const statusMutation = useMutation({
    mutationFn: async ({ membershipId, status }: { membershipId: string; status: string }) => {
      if (!clubId) throw new Error("Missing club");
      return clubLeaderService.updateMemberStatus(clubId, membershipId, { status: status as any });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leader", "members"] });
      queryClient.invalidateQueries({ queryKey: ["leader", "member-stats"] });
      setToast("Statut mis à jour");
      setTimeout(() => setToast(null), 3000);
    },
  });

  /* ── Derived ─────────────────────────────────────────────────────── */

  const members = membersData?.data ?? [];
  const meta = membersData?.meta;
  const totalPages = meta?.totalPages ?? 1;

  if (membersLoading && !membersData) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Chargement des membres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{I.check} {toast}</div>}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Membres du Club</h1>
          <p className={styles.subtitle}>Gérez les inscriptions et les membres de {clubData?.name || "votre club"}</p>
        </div>
        <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => setShowInvite(true)}>
          {I.userPlus} Inviter un membre
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles["statIcon--total"]}`}>{I.users}</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.totalMembers}</div>
              <div className={styles.statLabel}>Total membres</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles["statIcon--active"]}`}>{I.check}</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.active.count}</div>
              <div className={styles.statLabel}>Actifs</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles["statIcon--pending"]}`}>{I.clock}</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.pendingPayment.count}</div>
              <div className={styles.statLabel}>En attente</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles["statIcon--expired"]}`}>{I.alert}</div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.expired.count}</div>
              <div className={styles.statLabel}>Expirés</div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>{I.search}</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.filterTabs}>
            {[
              { key: null, label: "Tous", count: stats?.totalMembers },
              { key: "active", label: "Actifs", count: stats?.active?.count },
              { key: "pending_payment", label: "En attente", count: stats?.pendingPayment?.count },
              { key: "expired", label: "Expirés", count: stats?.expired?.count },
            ].map((f) => (
              <button
                key={f.key ?? "all"}
                className={`${styles.filterTab} ${statusFilter === f.key ? styles["filterTab--active"] : ""}`}
                onClick={() => { setStatusFilter(f.key); setPage(1); }}
              >
                {f.label}
                {f.count != null && <span className={styles.filterBadge}>{f.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <div className={styles.tableTitle}>Liste des membres</div>
            <div className={styles.tableSubtitle}>{meta?.total ?? 0} membre{(meta?.total ?? 0) !== 1 ? "s" : ""} au total</div>
          </div>
        </div>

        {members.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{I.users}</div>
            <div className={styles.emptyTitle}>Aucun membre trouvé</div>
            <div className={styles.emptyDesc}>
              {search || statusFilter ? "Aucun membre ne correspond à votre recherche" : "Invitez des membres pour commencer"}
            </div>
            {!search && !statusFilter && (
              <button className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => setShowInvite(true)}>
                {I.userPlus} Inviter un membre
              </button>
            )}
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Année</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const name = `${m.user?.firstName || ""} ${m.user?.lastName || ""}`.trim() || "—";
                  const color = getAvatarColor(name);
                  return (
                    <tr key={m._id}>
                      <td>
                        <div className={styles.memberCell}>
                          <div className={`${styles.avatar} ${styles[`avatar--${color}`]}`}>
                            {getInitials(m.user?.firstName, m.user?.lastName)}
                          </div>
                          <div className={styles.memberInfo}>
                            <div className={styles.memberName}>{name}</div>
                            <div className={styles.memberEmail}>{m.user?.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "#6B7280", fontSize: 13 }}>{m.academicYear || "—"}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`statusBadge--${m.status}`] || ""}`}>
                          <span className={styles.statusDot} />
                          {getStatusLabel(m.status || "")}
                        </span>
                      </td>
                      <td style={{ color: "#6B7280", fontSize: 13 }}>
                        {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          {m.status !== "active" && (
                            <button
                              className={styles.actionBtn}
                              title="Activer"
                              onClick={() => statusMutation.mutate({ membershipId: m._id, status: "active" })}
                            >
                              {I.check}
                            </button>
                          )}
                          {m.status === "active" && (
                            <button
                              className={`${styles.actionBtn} ${styles["actionBtn--danger"]}`}
                              title="Marquer expiré"
                              onClick={() => statusMutation.mutate({ membershipId: m._id, status: "expired" })}
                            >
                              {I.x}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Page {page} sur {totalPages}
                </div>
                <div className={styles.paginationBtns}>
                  <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    {I.arrowLeft}
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`${styles.pageBtn} ${pageNum === page ? styles["pageBtn--active"] : ""}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    {I.arrowRight}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className={styles.modalOverlay} onClick={() => setShowInvite(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>Inviter un membre</div>
              <button className={styles.modalClose} onClick={() => setShowInvite(false)}>{I.close}</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Adresse email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="membre@email.tn"
                  autoFocus
                />
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                L'utilisateur doit déjà avoir un compte. Année académique : {CURRENT_YEAR}
              </p>
            </div>
            <div className={styles.modalFoot}>
              <button className={`${styles.btn} ${styles["btn--secondary"]}`} onClick={() => setShowInvite(false)}>
                Annuler
              </button>
              <button
                className={`${styles.btn} ${styles["btn--primary"]}`}
                disabled={!inviteEmail.trim() || inviteMutation.isPending}
                onClick={() => inviteMutation.mutate()}
              >
                {inviteMutation.isPending ? "Invitation..." : "Inviter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
