import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, type User } from "../../features/users/usersService";
import { Role } from "../../types";
import styles from "./AdminUsers.module.css";

const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.CLUB_LEADER]: "Leader",
  [Role.STUDENT]: "Étudiant",
};

const ROLE_COLORS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "rose",
  [Role.CLUB_LEADER]: "amber",
  [Role.STUDENT]: "slate",
} as const;

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", { page, search, roleFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      return usersService.list(params as any);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      usersService.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => usersService.toggleActive(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const users = data?.data || [];
  const meta = data?.meta;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Membres</h1>
          <p className={styles.subtitle}>Gérez les utilisateurs et leurs rôles</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{meta?.total || 0}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{users.filter((u: User) => u.isActive).length}</span>
            <span className={styles.statLabel}>Actifs</span>
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
            placeholder="Rechercher un membre..."
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
            className={`${styles.filterTab} ${roleFilter === "" ? styles["filterTab--active"] : ""}`}
            onClick={() => { setRoleFilter(""); setPage(1); }}
          >
            Tous
          </button>
          <button
            className={`${styles.filterTab} ${roleFilter === Role.STUDENT ? styles["filterTab--active"] : ""}`}
            onClick={() => { setRoleFilter(Role.STUDENT); setPage(1); }}
          >
            Étudiants
          </button>
          <button
            className={`${styles.filterTab} ${roleFilter === Role.CLUB_LEADER ? styles["filterTab--active"] : ""}`}
            onClick={() => { setRoleFilter(Role.CLUB_LEADER); setPage(1); }}
          >
            Leaders
          </button>
          <button
            className={`${styles.filterTab} ${roleFilter === Role.SUPER_ADMIN ? styles["filterTab--active"] : ""}`}
            onClick={() => { setRoleFilter(Role.SUPER_ADMIN); setPage(1); }}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Chargement...</span>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p>Aucun membre trouvé</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Membre</th>
                    <th>Rôle</th>
                    <th>Inscrit</th>
                    <th>Dernière connexion</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr key={user._id} className={styles.row}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className={styles.avatarImg} />
                            ) : (
                              <span>{getInitials(user.firstName, user.lastName)}</span>
                            )}
                          </div>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`${styles.roleSelect} ${styles[`role--${ROLE_COLORS[user.role]}`]}`}
                          value={user.role}
                          onChange={(e) => roleMutation.mutate({ userId: user._id, role: e.target.value as Role })}
                          disabled={roleMutation.isPending}
                        >
                          <option value={Role.STUDENT}>Étudiant</option>
                          <option value={Role.CLUB_LEADER}>Leader</option>
                          <option value={Role.SUPER_ADMIN}>Admin</option>
                        </select>
                      </td>
                      <td className={styles.dateCell}>{formatDate(user.createdAt)}</td>
                      <td className={styles.dateCell}>{user.lastLogin ? timeAgo(user.lastLogin) : "Jamais"}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${user.isActive ? styles["status--active"] : styles["status--inactive"]}`}>
                          {user.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.actionBtn}
                          onClick={() => toggleMutation.mutate(user._id)}
                          disabled={toggleMutation.isPending}
                          title={user.isActive ? "Désactiver" : "Activer"}
                        >
                          {user.isActive ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  {meta.total} membres · Page {meta.page}/{meta.totalPages}
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
