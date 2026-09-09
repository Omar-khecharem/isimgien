import { useState, useEffect } from "react";
import { useAuth } from "../../features/auth";
import { useQuery } from "@tanstack/react-query";
import { clubsService } from "../../features/clubs/clubsService";
import { attendanceService } from "../../features/attendance/attendanceService";
import { membershipsService } from "../../features/memberships/membershipsService";
import { notificationsService } from "../../features/notifications/notificationsService";
import { eventsService } from "../../features/events/eventsService";
import styles from "./SuperAdminDashboard.module.css";

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return {
    formatted: `${h}:${m}:${s}`,
    running,
    toggle: () => setRunning((r) => !r),
    reset: () => { setSeconds(0); setRunning(false); },
  };
}

const WEEKLY_CHART = [
  { label: "Lun", value: 65 },
  { label: "Mar", value: 85 },
  { label: "Mer", value: 45 },
  { label: "Jeu", value: 95 },
  { label: "Ven", value: 75 },
  { label: "Sam", value: 30 },
  { label: "Dim", value: 10 },
];

const MONTHLY_CHART = [
  { label: "Jan", value: 120 },
  { label: "Fév", value: 180 },
  { label: "Mar", value: 240 },
  { label: "Avr", value: 200 },
  { label: "Mai", value: 310 },
  { label: "Jun", value: 280 },
  { label: "Jul", value: 150 },
  { label: "Aoû", value: 90 },
  { label: "Sep", value: 260 },
];

const CLUB_SPARKLINE = [40, 55, 45, 70, 60, 80, 75, 90, 85];
const MEMBER_SPARKLINE = [20, 35, 30, 50, 45, 65, 60, 80, 78];
const ATTENDANCE_SPARKLINE = [50, 40, 60, 55, 70, 65, 85, 75, 95];
const EVENTS_SPARKLINE = [15, 25, 20, 35, 30, 45, 40, 55, 50];

const DONUT_DATA = [
  { label: "Informatique", value: 42, color: "#0A5F3A" },
  { label: "Design", value: 28, color: "#3B82F6" },
  { label: "Business", value: 18, color: "#8B5CF6" },
  { label: "Science", value: 12, color: "#F59E0B" },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 36;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={styles.sparkline}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${color.replace("#", "")})`}
        stroke="none"
        opacity="0.15"
      />
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DonutChart() {
  const total = DONUT_DATA.reduce((a, b) => a + b.value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className={styles.donutWrap}>
      <div style={{ position: "relative" }}>
        <svg className={styles.donutSvg} viewBox="0 0 120 120">
          {DONUT_DATA.map((d) => {
            const pct = d.value / total;
            const dash = pct * circumference;
            const offset = accumulated * circumference;
            accumulated += pct;
            return (
              <circle
                key={d.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className={styles.donutCenter}>
          <span className={styles.donutCenterValue}>{total}%</span>
          <span className={styles.donutCenterLabel}>Répartition</span>
        </div>
      </div>
      <div className={styles.donutLegend}>
        {DONUT_DATA.map((d) => (
          <div key={d.label} className={styles.donutLegendItem}>
            <span className={styles.donutLegendDot} style={{ background: d.color }} />
            <span>{d.label}</span>
            <span className={styles.donutLegendValue}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const timer = useTimer();
  const [chartView, setChartView] = useState<"week" | "month">("week");

  const { data: clubsData } = useQuery({
    queryKey: ["super-admin", "clubs"],
    queryFn: async () => { const res = await clubsService.list({ limit: 50 }); return res.data; },
    enabled: !!user,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["super-admin", "attendance"],
    queryFn: async () => { const res = await attendanceService.getGlobalSummary(); return res.data; },
    enabled: !!user,
  });

  const { data: membershipsData } = useQuery({
    queryKey: ["super-admin", "memberships"],
    queryFn: async () => { const res = await membershipsService.getGlobalSummary(); return res.data; },
    enabled: !!user,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["super-admin", "notifications"],
    queryFn: async () => { const res = await notificationsService.getGlobalSummary(); return res.data; },
    enabled: !!user,
  });

  const { data: eventsData } = useQuery({
    queryKey: ["super-admin", "events"],
    queryFn: async () => { const res = await eventsService.listPublic({ limit: 100 }); return res.data; },
    enabled: !!user,
  });

  const totalClubs = clubsData?.length || 0;
  const totalMembers = membershipsData?.totalMembers || 0;
  const totalAttendance = attendanceData?.totalAttendance || 0;
  const totalEvents = eventsData?.total || eventsData?.data?.length || 0;
  const notifications = notificationsData?.recent || [];
  const chartData = chartView === "week" ? WEEKLY_CHART : MONTHLY_CHART;
  const maxChart = Math.max(...chartData.map((d) => d.value));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Bonjour, {user?.firstName}</h1>
          <p className={styles.subtitle}>Vue d'ensemble de la plateforme</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerDate}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* ═══ Row 1: Rich Stats ═══ */}
      <div className={styles.row1}>
        {/* ── Clubs ── */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={`${styles.statIcon} ${styles["statIcon--emerald"]}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L4 5.5v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10v-5L11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className={`${styles.statTrend} ${styles["statTrend--up"]}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              +2
            </span>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Clubs actifs</div>
            <div className={styles.statValue}>{totalClubs}</div>
            <div className={styles.statSecondary}>10 actifs · 2 inactifs</div>
          </div>
          <div className={styles.statFooter}>
            <Sparkline data={CLUB_SPARKLINE} color="#0A5F3A" />
          </div>
        </div>

        {/* ── Membres ── */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={`${styles.statIcon} ${styles["statIcon--blue"]}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M4 19c0-3 2.5-5.5 5-5.5s5 2.5 5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="15.5" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.5" /><path d="M15.5 11.5c2 0 3.5 1.5 3.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <span className={`${styles.statTrend} ${styles["statTrend--up"]}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              +12%
            </span>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Membres inscrits</div>
            <div className={styles.statValue}>{totalMembers}</div>
            <div className={styles.statSecondary}>28 nouveaux ce mois</div>
          </div>
          <div className={styles.statFooter}>
            <Sparkline data={MEMBER_SPARKLINE} color="#3B82F6" />
          </div>
        </div>

        {/* ── Présences ── */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={`${styles.statIcon} ${styles["statIcon--violet"]}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className={`${styles.statTrend} ${styles["statTrend--up"]}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              +5%
            </span>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Présences totales</div>
            <div className={styles.statValue}>{totalAttendance.toLocaleString()}</div>
            <div className={styles.statSecondary}>32 aujourd'hui · 78% taux moyen</div>
          </div>
          <div className={styles.statFooter}>
            <Sparkline data={ATTENDANCE_SPARKLINE} color="#8B5CF6" />
          </div>
        </div>

        {/* ── Événements ── */}
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <div className={`${styles.statIcon} ${styles["statIcon--amber"]}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3 8.5h16" stroke="currentColor" strokeWidth="1.5" /><path d="M7 2.5v3.5M15 2.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="11" cy="14" r="1.5" fill="currentColor" /></svg>
            </div>
            <span className={`${styles.statTrend} ${styles["statTrend--up"]}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              +8
            </span>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Événements créés</div>
            <div className={styles.statValue}>{totalEvents}</div>
            <div className={styles.statSecondary}>3 cette semaine · 12 ce mois</div>
          </div>
          <div className={styles.statFooter}>
            <Sparkline data={EVENTS_SPARKLINE} color="#F59E0B" />
          </div>
        </div>

        {/* ── Timer ── */}
        <div className={styles.timerCard}>
          <div className={styles.timerHead}>
            <span className={`${styles.timerStatus} ${timer.running ? styles["timerStatus--live"] : ""}`}>
              {timer.running ? "En cours" : "Arrêté"}
            </span>
          </div>
          <div className={styles.timerTime}>{timer.formatted}</div>
          <div className={styles.timerLabel}>Chrono session</div>
          <div className={styles.timerControls}>
            <button className={`${styles.timerBtn} ${timer.running ? styles.timerBtnPause : styles.timerBtnStart}`} onClick={timer.toggle}>
              {timer.running ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 2.5l9 5.5-9 5.5V2.5z" fill="currentColor" /></svg>
              )}
            </button>
            <button className={`${styles.timerBtn} ${styles.timerBtnReset}`} onClick={timer.reset}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1011.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Row 2: Bar Chart + Donut + Notifications ═══ */}
      <div className={styles.row2}>
        {/* Bar Chart */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3 className={styles.cardTitle}>Activité des présences</h3>
              <p className={styles.cardSubtitle}>Tendance sur la période</p>
            </div>
            <div className={styles.chartTabs}>
              <button className={`${styles.chartTab} ${chartView === "week" ? styles["chartTab--active"] : ""}`} onClick={() => setChartView("week")}>Semaine</button>
              <button className={`${styles.chartTab} ${chartView === "month" ? styles["chartTab--active"] : ""}`} onClick={() => setChartView("month")}>Mois</button>
            </div>
          </div>
          <div className={styles.chartArea}>
            {chartData.map((d) => (
              <div key={d.label} className={styles.chartCol}>
                <div className={styles.chartBarWrap}>
                  <div className={styles.chartBar} style={{ height: `${(d.value / maxChart) * 100}%` }} />
                </div>
                <span className={styles.chartLabel}>{d.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.chartSummary}>
            <div className={styles.chartSummaryItem}>
              <span className={styles.chartSummaryDot} style={{ background: "#0A5F3A" }} />
              <span>Total</span>
              <strong>{chartData.reduce((a, b) => a + b.value, 0).toLocaleString()}</strong>
            </div>
            <div className={styles.chartSummaryItem}>
              <span className={styles.chartSummaryDot} style={{ background: "#3B82F6" }} />
              <span>Moyenne</span>
              <strong>{Math.round(chartData.reduce((a, b) => a + b.value, 0) / chartData.length)}</strong>
            </div>
            <div className={styles.chartSummaryItem}>
              <span className={styles.chartSummaryDot} style={{ background: "#F59E0B" }} />
              <span>Pic</span>
              <strong>{maxChart}</strong>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3 className={styles.cardTitle}>Répartition</h3>
              <p className={styles.cardSubtitle}>Par domaine</p>
            </div>
          </div>
          <DonutChart />
        </div>

        {/* Notifications */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3 className={styles.cardTitle}>Notifications</h3>
              <p className={styles.cardSubtitle}>Dernières alertes</p>
            </div>
            {notifications.length > 0 && <span className={styles.cardBadge}>{notifications.length}</span>}
          </div>
          <div className={styles.cardBody}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className={styles.notifList}>
                {notifications.slice(0, 5).map((n: { _id: string; title: string; message: string; createdAt: string }) => (
                  <div key={n._id} className={styles.notifItem}>
                    <div className={styles.notifDot} />
                    <div className={styles.notifInfo}>
                      <div className={styles.notifTitle}>{n.title}</div>
                      <div className={styles.notifMsg}>{n.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Row 3: Quick Actions ═══ */}
      <div className={styles.row3}>
        <a href="/admin/users" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--blue"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Membres</span>
        </a>
        <a href="/admin/events" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--amber"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" /><path d="M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Événements</span>
        </a>
        <a href="/admin/forms" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--violet"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Formulaires</span>
        </a>
        <a href="/admin/attendance" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--emerald"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 5.5v5l3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Présences</span>
        </a>
        <a href="/admin/settings" className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles["actionIcon--slate"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 3v2.5M10 14.5v2.5M3 10h2.5M14.5 10H17M5 5l1.8 1.8M13.2 13.2L15 15M5 15l1.8-1.8M13.2 6.8L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Paramètres</span>
        </a>
      </div>
    </div>
  );
}
