import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth";
import {
  useUpcomingTrainings,
  useUpcomingEvents,
  useMyAttendance,
  useMyMemberships,
  useStudentClubs,
} from "../../features/student";
import styles from "./StudentDashboard.module.css";

export function StudentDashboard() {
  const { user } = useAuth();
  const { data: upcomingTrainings, isLoading: tLoading } = useUpcomingTrainings();
  const { data: upcomingEvents, isLoading: eLoading } = useUpcomingEvents();
  const { data: attendanceData, isLoading: aLoading } = useMyAttendance(1, 50);
  const { data: membershipsData } = useMyMemberships();
  const { data: clubsData } = useStudentClubs();

  const totalEvents = (upcomingTrainings?.length ?? 0) + (upcomingEvents?.length ?? 0);
  const activeMemberships = membershipsData?.meta?.total ?? 0;
  const allAttendance = attendanceData?.data ?? [];
  const validatedParticipations = allAttendance.filter(
    (a) => a.status === "checked_in" || a.status === "checked_out"
  ).length;
  const joinedClubs = clubsData?.length ?? 0;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className={styles.page}>

      {/* ═══ Welcome Banner ═══ */}
      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerLeft}>
            <div className={styles.bannerAvatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" className={styles.bannerAvatarImg} />
              ) : (
                <span className={styles.bannerInitials}>{initials}</span>
              )}
            </div>
            <div className={styles.bannerText}>
              <p className={styles.bannerDate}>{dateStr}</p>
              <h1 className={styles.bannerGreeting}>
                {greeting}, <span className={styles.bannerName}>{user?.firstName}</span>
              </h1>
              <p className={styles.bannerSubtitle}>
                {joinedClubs > 0
                  ? `Vous êtes membre de ${joinedClubs} club${joinedClubs > 1 ? "s" : ""}`
                  : "Rejoignez un club pour commencer"}
              </p>
            </div>
          </div>
          <div className={styles.bannerQuickStats}>
            <Link to="/student/clubs" className={styles.bannerStat}>
              <span className={styles.bannerStatValue}>{joinedClubs}</span>
              <span className={styles.bannerStatLabel}>Club{joinedClubs > 1 ? "s" : ""}</span>
            </Link>
            <div className={styles.bannerDivider} />
            <Link to="/student/attendance" className={styles.bannerStat}>
              <span className={styles.bannerStatValue}>{validatedParticipations}</span>
              <span className={styles.bannerStatLabel}>Présences</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Stats Grid ═══ */}
      <section className={styles.statsGrid}>
        <Link to="/student/events" className={`${styles.stat} ${styles["stat--emerald"]}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 7.5h16" stroke="currentColor" strokeWidth="1.5"/><path d="M6 1.5v3M14 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <svg className={styles.statArrow} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{totalEvents}</span>
            <span className={styles.statLabel}>Événements à venir</span>
            <span className={styles.statSubtitle}>{upcomingTrainings?.length ?? 0} formations · {upcomingEvents?.length ?? 0} événements</span>
          </div>
        </Link>
        <Link to="/student/clubs" className={`${styles.stat} ${styles["stat--blue"]}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 18c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <svg className={styles.statArrow} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{activeMemberships}</span>
            <span className={styles.statLabel}>Adhésions actives</span>
            <span className={styles.statSubtitle}>{activeMemberships > 0 ? "Tous actifs" : "Aucune adhésion"}</span>
          </div>
        </Link>
        <Link to="/student/attendance" className={`${styles.stat} ${styles["stat--violet"]}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <svg className={styles.statArrow} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{validatedParticipations}</span>
            <span className={styles.statLabel}>Présences validées</span>
            <span className={styles.statSubtitle}>{allAttendance.length} participation{allAttendance.length > 1 ? "s" : ""} au total</span>
          </div>
        </Link>
        <Link to="/student/clubs" className={`${styles.stat} ${styles["stat--amber"]}`}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L4 5.5v4.5c0 4 3 8 6 9.5 3-1.5 6-5.5 6-9.5V5.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <svg className={styles.statArrow} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{joinedClubs}</span>
            <span className={styles.statLabel}>Clubs rejoints</span>
            <span className={styles.statSubtitle}>{joinedClubs > 0 ? "Tous actifs" : "Aucun club rejoint"}</span>
          </div>
        </Link>
      </section>

      {/* ═══ Quick Actions ═══ */}
      <section className={styles.actionsRow}>
        <Link to="/student/events" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--emerald"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8h14" stroke="currentColor" strokeWidth="1.5"/><path d="M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span className={styles.actionLabel}>Événements</span>
        </Link>
        <Link to="/student/clubs" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--blue"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L4 5.5v4.5c0 4 3 8 6 9.5 3-1.5 6-5.5 6-9.5V5.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </div>
          <span className={styles.actionLabel}>Clubs</span>
        </Link>
        <Link to="/student/attendance" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--violet"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className={styles.actionLabel}>Présences</span>
        </Link>
        <Link to="/student/settings" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--amber"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span className={styles.actionLabel}>Paramètres</span>
        </Link>
      </section>

      {/* ═══ Two Column Layout ═══ */}
      <div className={styles.mainGrid}>

        {/* Left — Events */}
        <Card>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Prochains événements</h2>
              <p className={styles.cardSubtitle}>{totalEvents} événement{totalEvents > 1 ? "s" : ""} prévu{totalEvents > 1 ? "s" : ""}</p>
            </div>
            {totalEvents > 0 && <Link to="/student/events" className={styles.cardLink}>Voir tout →</Link>}
          </div>
          <div className={styles.cardBody}>
            {tLoading && eLoading ? (
              <div className={styles.loadingSmall}>
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
              </div>
            ) : totalEvents === 0 ? (
              <Empty icon="calendar" title="Aucun événement" desc="Pas de formation prévue pour le moment." />
            ) : (
              <div className={styles.eventsList}>
                {upcomingTrainings?.slice(0, 4).map((t) => (
                  <EventRow key={t._id} type="training" title={t.title} date={t.date} startTime={t.startTime} endTime={t.endTime} location={t.location} poster={t.poster} />
                ))}
                {upcomingEvents?.slice(0, 4).map((e) => (
                  <EventRow key={e._id} type="event" title={e.title} date={e.date} startTime={e.startTime} endTime={e.endTime} location={e.location} poster={e.poster} />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right — Attendance + Calendar */}
        <Card>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Historique de présence</h2>
              <p className={styles.cardSubtitle}>{validatedParticipations} présence{validatedParticipations > 1 ? "s" : ""} validée{validatedParticipations > 1 ? "s" : ""}</p>
            </div>
            {allAttendance.length > 0 && <Link to="/student/attendance" className={styles.cardLink}>Voir tout →</Link>}
          </div>
          <div className={styles.cardBody}>
            {aLoading ? (
              <div className={styles.loadingSmall}>
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
              </div>
            ) : (
              <>
                <PremiumCalendar attendanceData={allAttendance} />
                {allAttendance.length > 0 ? (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Formation</th>
                          <th>Arrivée</th>
                          <th>Départ</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allAttendance.slice(0, 5).map((r) => (
                          <tr key={r._id}>
                            <td className={styles.tdBold}>{r.training.title}</td>
                            <td>{r.checkIn.time ? new Date(r.checkIn.time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td>{r.checkOut.time ? new Date(r.checkOut.time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td>
                              <Tag variant={r.status === "checked_out" ? "green" : r.status === "checked_in" ? "blue" : "yellow"}>
                                {r.status === "checked_out" ? "Présent" : r.status === "checked_in" ? "En cours" : "Absent"}
                              </Tag>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.emptySmall}>
                    <p>Aucune présence enregistrée pour le moment.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* ═══ Memberships — Full Width ═══ */}
      <Card>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Mes adhésions</h2>
            <p className={styles.cardSubtitle}>{activeMemberships} adhésion{activeMemberships > 1 ? "s" : ""} active{activeMemberships > 1 ? "s" : ""}</p>
          </div>
          {(membershipsData?.data?.length ?? 0) > 0 && <Link to="/student/clubs" className={styles.cardLink}>Voir tout →</Link>}
        </div>
        <div className={styles.cardBody}>
          {(membershipsData?.data?.length ?? 0) === 0 ? (
            <Empty icon="wallet" title="Aucune adhésion" desc="Rejoignez un club pour voir vos adhésions ici." />
          ) : (
            <div className={styles.membershipsGrid}>
              {membershipsData?.data?.slice(0, 6).map((m) => {
                const clubId = typeof m.club === "string" ? m.club : m.club._id;
                const clubData = clubsData?.find((c) => c.club._id === clubId);
                const clubLogo = clubData?.club?.logo;
                const clubName = typeof m.club === "string" ? m.club : m.club.name;
                const initials = clubName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <Link to="/student/clubs" key={m._id} className={styles.membershipCard}>
                    <div className={styles.membershipCardLeft}>
                      <div className={styles.membershipLogo}>
                        {clubLogo ? (
                          <img src={clubLogo} alt="" className={styles.membershipLogoImg} />
                        ) : (
                          <span className={styles.membershipLogoInitials}>{initials}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.membershipCardRight}>
                      <div className={styles.membershipCardTop}>
                        <span className={styles.membershipClub}>{clubName}</span>
                        <Tag variant={m.status === "active" ? "green" : m.status === "expired" ? "red" : "yellow"} size="sm">
                          {m.status === "active" ? "Actif" : m.status === "expired" ? "Expiré" : "En attente"}
                        </Tag>
                      </div>
                      <div className={styles.membershipCardBottom}>
                        <span className={styles.membershipYear}>{m.academicYear}</span>
                        {m.amountPaid > 0 && <span className={styles.membershipAmount}>{m.amountPaid} TND</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Premium Calendar
   ═══════════════════════════════════════════════════════════════════════════ */

function PremiumCalendar({ attendanceData }: { attendanceData: any[] }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  const attendanceDates = useMemo(() => {
    const set = new Set<string>();
    attendanceData.forEach((r) => {
      const d = new Date(r.checkIn.time ?? r.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [attendanceData, month, year]);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const weekDays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button className={styles.calendarNav} onClick={prevMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h3 className={styles.calendarTitle}>{monthLabel}</h3>
        <button className={styles.calendarNav} onClick={nextMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className={styles.calendarGrid}>
        {weekDays.map((d) => (
          <span key={d} className={styles.calendarWeekday}>{d}</span>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <span key={`empty-${i}`} className={styles.calendarDayEmpty} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const hasAttendance = attendanceDates.has(day);
          const isToday = isCurrentMonth && today.getDate() === day;
          return (
            <span
              key={day}
              className={`${styles.calendarDay} ${hasAttendance ? styles["calendarDay--active"] : ""} ${isToday ? styles["calendarDay--today"] : ""}`}
            >
              {day}
              {hasAttendance && <span className={styles.calendarDot} />}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Primitives
   ═══════════════════════════════════════════════════════════════════════════ */

function Tag({ children, variant, size = "md" }: { children: React.ReactNode; variant: "green" | "blue" | "yellow" | "red"; size?: "sm" | "md" }) {
  return <span className={`${styles.tag} ${styles[`tag--${variant}`]} ${styles[`tag--${size}`]}`}>{children}</span>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}

function Empty({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const icons: Record<string, React.ReactNode> = {
    calendar: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8.5h16" stroke="currentColor" strokeWidth="1.5"/><path d="M7 2.5v3.5M15 2.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    check: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    wallet: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9h16" stroke="currentColor" strokeWidth="1.5"/><path d="M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  };
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{icons[icon]}</div>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDesc}>{desc}</p>
    </div>
  );
}

function EventRow({ type, title, date, startTime, endTime, location, poster }: { type: "training" | "event"; title: string; date: string; startTime: string; endTime: string; location: string; poster?: string | null }) {
  const d = new Date(date);
  const dayNum = d.getDate();
  const monthStr = d.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase();
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const label = diffDays <= 0 ? "Aujourd'hui" : diffDays === 1 ? "Demain" : `${diffDays}j`;

  return (
    <div className={styles.eventRow}>
      <div className={styles.eventDate}>
        <span className={styles.eventDay}>{dayNum}</span>
        <span className={styles.eventMonth}>{monthStr}</span>
      </div>
      {poster && <div className={styles.eventPoster}><img src={poster} alt="" /></div>}
      <div className={styles.eventInfo}>
        <div className={styles.eventRow1}>
          <span className={styles.eventTitle}>{title}</span>
          <Tag variant={type === "training" ? "blue" : "green"} size="sm">{type === "training" ? "Formation" : "Événement"}</Tag>
        </div>
        <div className={styles.eventRow2}>
          <span className={styles.eventMeta}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            {startTime} — {endTime}
          </span>
          <span className={styles.eventMeta}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1.5a4 4 0 014 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2"/></svg>
            {location}
          </span>
        </div>
      </div>
      <span className={styles.eventLabel}>{label}</span>
    </div>
  );
}
