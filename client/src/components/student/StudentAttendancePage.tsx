import { useState } from "react";
import { useMyAttendance } from "../../features/student/useMyAttendance";
import { useStudentClubs } from "../../features/student/useStudentClubs";
import styles from "./StudentAttendancePage.module.css";

type Tab = "history" | "clubs";

export function StudentAttendancePage() {
  const [tab, setTab] = useState<Tab>("history");
  const { data: attendanceData, isLoading: attendanceLoading } = useMyAttendance(1, 50);
  const { data: clubsData, isLoading: clubsLoading } = useStudentClubs();

  const records = attendanceData?.data ?? [];
  const clubs = clubsData ?? [];

  const isLoading = attendanceLoading || clubsLoading;

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "checked_out").length,
    inProgress: records.filter((r) => r.status === "checked_in").length,
    absent: records.filter((r) => r.status === "absent" || r.status === "not_attended").length,
    rate:
      records.length > 0
        ? Math.round(
            (records.filter((r) => r.status === "checked_out" || r.status === "checked_in").length /
              records.length) *
              100
          )
        : 0,
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Membres & Présences</h1>
          <p className={styles.subtitle}>Suivez vos participations et vos clubs.</p>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard label="Total sessions" value={stats.total} color="gray" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 7h14" stroke="currentColor" strokeWidth="1.5"/></svg>} />
        <StatCard label="Présent" value={stats.present} color="green" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <StatCard label="En cours" value={stats.inProgress} color="blue" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
        <StatCard label="Taux" value={`${stats.rate}%`} color={stats.rate >= 70 ? "green" : stats.rate >= 40 ? "yellow" : "red"} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 13l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === "history" ? styles["tab--active"] : ""}`} onClick={() => setTab("history")}>
          Historique
          {stats.total > 0 && <span className={styles.tabCount}>{stats.total}</span>}
        </button>
        <button className={`${styles.tab} ${tab === "clubs" ? styles["tab--active"] : ""}`} onClick={() => setTab("clubs")}>
          Mes clubs
          {clubs.length > 0 && <span className={styles.tabCount}>{clubs.length}</span>}
        </button>
      </div>

      {/* History */}
      {tab === "history" && (
        <div className={styles.content}>
          {records.length === 0 ? (
            <Empty icon="clock" title="Aucune présence" desc="Votre historique de présence apparaîtra ici." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Formation</th>
                    <th>Date</th>
                    <th>Arrivée</th>
                    <th>Départ</th>
                    <th>Durée</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const checkIn = r.checkIn.time ? new Date(r.checkIn.time) : null;
                    const checkOut = r.checkOut.time ? new Date(r.checkOut.time) : null;
                    let duration = "—";
                    if (checkIn && checkOut) {
                      const mins = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000);
                      const h = Math.floor(mins / 60);
                      const m = mins % 60;
                      duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
                    }
                    return (
                      <tr key={r._id}>
                        <td className={styles.tdBold}>{r.training.title}</td>
                        <td className={styles.tableMuted}>
                          {new Date(r.training.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className={styles.tableMuted}>
                          {checkIn
                            ? checkIn.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td className={styles.tableMuted}>
                          {checkOut
                            ? checkOut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td className={styles.tableMuted}>{duration}</td>
                        <td>
                          <Tag
                            variant={
                              r.status === "checked_out"
                                ? "green"
                                : r.status === "checked_in"
                                ? "blue"
                                : "red"
                            }
                          >
                            {r.status === "checked_out"
                              ? "Présent"
                              : r.status === "checked_in"
                              ? "En cours"
                              : r.status === "absent"
                              ? "Absent"
                              : "Non participé"}
                          </Tag>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Clubs */}
      {tab === "clubs" && (
        <div className={styles.content}>
          {clubs.length === 0 ? (
            <Empty icon="club" title="Aucun club" desc="Rejoignez un club pour commencer." />
          ) : (
            <div className={styles.clubsGrid}>
              {clubs.map(({ club, membership }) => {
                const initials = club.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={club._id} className={styles.clubCard}>
                    <div className={styles.clubHeader}>
                      <div className={styles.clubLogo}>
                        {club.logo ? (
                          <img src={club.logo} alt="" className={styles.clubLogoImg} />
                        ) : (
                          <div className={styles.clubLogoFallback}>{initials}</div>
                        )}
                      </div>
                      <div className={styles.clubInfo}>
                        <h3 className={styles.clubName}>{club.name}</h3>
                        <Tag variant={membership.status === "active" ? "green" : "yellow"} size="sm">
                          {membership.status === "active" ? "Actif" : "En attente"}
                        </Tag>
                      </div>
                    </div>
                    <div className={styles.clubMeta}>
                      <div className={styles.clubMetaItem}>
                        <span className={styles.clubMetaLabel}>Année</span>
                        <span className={styles.clubMetaValue}>{membership.academicYear}</span>
                      </div>
                      <div className={styles.clubMetaItem}>
                        <span className={styles.clubMetaLabel}>Montant</span>
                        <span className={styles.clubMetaValue}>{membership.amountPaid > 0 ? `${membership.amountPaid} TND` : "—"}</span>
                      </div>
                      {membership.paymentDate && (
                        <div className={styles.clubMetaItem}>
                          <span className={styles.clubMetaLabel}>Payé le</span>
                          <span className={styles.clubMetaValue}>
                            {new Date(membership.paymentDate).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Primitives
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: "gray" | "green" | "blue" | "yellow" | "red";
  icon: React.ReactNode;
}) {
  return (
    <div className={`${styles.stat} ${styles[`stat--${color}`]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statBody}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}

function Tag({
  children,
  variant,
  size = "md",
}: {
  children: React.ReactNode;
  variant: "green" | "blue" | "yellow" | "red";
  size?: "sm" | "md";
}) {
  return (
    <span className={`${styles.tag} ${styles[`tag--${variant}`]} ${styles[`tag--${size}`]}`}>
      {children}
    </span>
  );
}

function Empty({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const icons: Record<string, React.ReactNode> = {
    clock: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M11 7v4.5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    club: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L4 5.5v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10v-5L11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  };
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{icons[icon]}</div>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDesc}>{desc}</p>
    </div>
  );
}
