import { useState, useEffect } from "react";
import { useAuth } from "../../features/auth";
import { useClubLeaderDashboard } from "./useClubLeaderDashboard";
import { clubsService } from "../clubs/clubsService";
import { useQuery } from "@tanstack/react-query";
import styles from "./ClubLeaderDashboard.module.css";
import type { AnalyticsDay, FinanceSummary, UpcomingTraining, MemberRecord } from "./clubLeaderService";

/* ─── Timer Hook ─────────────────────────────────────────────────────── */

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

/* ─── Sparkline ──────────────────────────────────────────────────────── */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 40;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={styles.sparkline}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${color.replace("#", "")})`}
        stroke="none"
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Sparkline Data ─────────────────────────────────────────────────── */

const FORMATIONS_SPARKLINE = [40, 55, 45, 70, 60, 80, 75, 90, 85];
const MEMBERS_SPARKLINE = [20, 35, 30, 50, 45, 65, 60, 80, 78];
const PRESENCES_SPARKLINE = [50, 40, 60, 55, 70, 65, 85, 75, 95];
const CAISSE_SPARKLINE = [30, 45, 35, 55, 50, 70, 60, 75, 80];

/* ─── Weekly Chart Data ──────────────────────────────────────────────── */

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

/* ─── Helper ─────────────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════════════
   Chart
   ═══════════════════════════════════════════════════════════════════════ */

function PresenceChart({ data }: { data: AnalyticsDay[] }) {
  const [view, setView] = useState<"week" | "month">("week");
  const chartData = view === "week" ? WEEKLY_CHART : MONTHLY_CHART;
  const maxChart = Math.max(...chartData.map((d) => d.value));

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Activité des présences</h3>
          <p className={styles.cardSubtitle}>Tendance sur la période</p>
        </div>
        <div className={styles.chartTabs}>
          <button className={`${styles.chartTab} ${view === "week" ? styles["chartTab--active"] : ""}`} onClick={() => setView("week")}>Semaine</button>
          <button className={`${styles.chartTab} ${view === "month" ? styles["chartTab--active"] : ""}`} onClick={() => setView("month")}>Mois</button>
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
          <span className={styles.chartSummaryDot} style={{ background: "#059669" }} />
          <span>Total</span>
          <strong>{chartData.reduce((a, b) => a + b.value, 0).toLocaleString()}</strong>
        </div>
        <div className={styles.chartSummaryItem}>
          <span className={styles.chartSummaryDot} style={{ background: "#3B82F6" }} />
          <span>Moyenne</span>
          <strong>{Math.round(chartData.reduce((a, b) => a + b.value, 0) / chartData.length)}</strong>
        </div>
        <div className={styles.chartSummaryItem}>
          <span className={styles.chartSummaryDot} style={{ background: "#D97706" }} />
          <span>Pic</span>
          <strong>{maxChart}</strong>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Finance Card
   ═══════════════════════════════════════════════════════════════════════ */

function FinanceCard({ finance }: { finance: FinanceSummary }) {
  const { totalIncome, totalExpenses, balance, recentTransactions } = finance;
  const maxVal = Math.max(totalIncome, 1);
  const percentage = Math.min(Math.round((balance / maxVal) * 100), 100);
  const circumference = Math.PI * 80;
  const filled = (percentage / 100) * circumference;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Caisse du Club</h3>
          <p className={styles.cardSubtitle}>Revenus et dépenses</p>
        </div>
      </div>

      <div className={styles.gaugeArea}>
        <div className={styles.gaugeWrap}>
          <svg viewBox="0 0 200 110" className={styles.gaugeSvg}>
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F1F5F9" strokeWidth={14} strokeLinecap="round" />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={balance >= 0 ? "#059669" : "#DC2626"}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference - filled}`}
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          </svg>
          <div className={styles.gaugeCenter}>
            <span className={styles.gaugeValue}>{percentage}%</span>
            <span className={styles.gaugeLabel}>Solde / Revenus</span>
          </div>
        </div>
      </div>

      <div className={styles.gaugeSummary}>
        <div className={styles.gaugeSummaryItem}>
          <div className={styles.gaugeSummaryValue} style={{ color: "#059669" }}>{totalIncome.toLocaleString("fr-FR")}</div>
          <div className={styles.gaugeSummaryLabel}>Revenus (TND)</div>
        </div>
        <div className={styles.gaugeSummaryItem}>
          <div className={styles.gaugeSummaryValue} style={{ color: "#DC2626" }}>{totalExpenses.toLocaleString("fr-FR")}</div>
          <div className={styles.gaugeSummaryLabel}>Dépenses (TND)</div>
        </div>
        <div className={styles.gaugeSummaryItem}>
          <div className={styles.gaugeSummaryValue} style={{ color: balance >= 0 ? "#059669" : "#DC2626" }}>{balance.toLocaleString("fr-FR")}</div>
          <div className={styles.gaugeSummaryLabel}>Solde (TND)</div>
        </div>
      </div>

      <div className={styles.gaugeTxList}>
        {recentTransactions.slice(0, 3).map((tx) => (
          <div key={tx._id} className={styles.gaugeTxItem}>
            <div className={`${styles.gaugeTxIcon} ${tx.type === "income" ? styles["gaugeTxIcon--income"] : styles["gaugeTxIcon--expense"]}`}>
              {tx.type === "income" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
              )}
            </div>
            <div className={styles.gaugeTxInfo}>
              <div className={styles.gaugeTxTitle}>{tx.description}</div>
              <div className={styles.gaugeTxCategory}>{tx.category}</div>
            </div>
            <span className={`${styles.gaugeTxAmount} ${tx.type === "income" ? styles["gaugeTxAmount--income"] : styles["gaugeTxAmount--expense"]}`}>
              {tx.type === "income" ? "+" : "-"}{tx.amount.toLocaleString("fr-FR")} TND
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Activity Card
   ═══════════════════════════════════════════════════════════════════════ */

const ACTIVITIES = [
  { id: "1", color: "#3B82F6", title: "Nouveau membre rejoint", msg: "Ahmed Benali a rejoint le club", time: "Il y a 12 min" },
  { id: "2", color: "#059669", title: "Formation terminée", msg: "Initiation à la photographie — 18 présents", time: "Il y a 2h" },
  { id: "3", color: "#7C3AED", title: "Formation planifiée", msg: "Workshop Design Graphique — 15 Sept", time: "Il y a 3h" },
  { id: "4", color: "#D97706", title: "Formulaire soumis", msg: "3 nouvelles réponses au formulaire", time: "Il y a 5h" },
  { id: "5", color: "#059669", title: "Paiement reçu", msg: "Cotisation de Sarah Meziane — 2 000 TND", time: "Hier" },
];

function ActivityCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Activité Récente</h3>
          <p className={styles.cardSubtitle}>Dernières actions du club</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.notifList}>
          {ACTIVITIES.map((a) => (
            <div key={a.id} className={styles.notifItem}>
              <div className={styles.notifDot} style={{ background: a.color }} />
              <div className={styles.notifInfo}>
                <div className={styles.notifTitle}>{a.title}</div>
                <div className={styles.notifMsg}>{a.msg}</div>
              </div>
              <span className={styles.notifTime}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Upcoming Trainings
   ═══════════════════════════════════════════════════════════════════════ */

function UpcomingCard({ items }: { items: UpcomingTraining[] }) {
  const now = new Date();
  const todayStr = now.toDateString();

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Formations à Venir</h3>
          <p className={styles.cardSubtitle}>{items.length} planifiée(s)</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            </div>
            <p>Aucune formation prévue</p>
          </div>
        ) : (
          items.map((item) => {
            const date = new Date(item.date);
            const day = date.getDate();
            const month = date.toLocaleDateString("fr-FR", { month: "short" });
            const isToday = todayStr === date.toDateString();

            return (
              <div key={item._id} className={styles.listItem}>
                <div className={`${styles.listItemDate} ${isToday ? styles["listItemDate--today"] : ""}`}>
                  <span className={styles.listItemDateDay}>{day}</span>
                  <span className={styles.listItemDateMonth}>{month}</span>
                </div>
                <div className={styles.listItemContent}>
                  <div className={styles.listItemTitle}>{item.title}</div>
                  <div className={styles.listItemMeta}>{item.startTime} — {item.endTime} · {item.location}</div>
                </div>
                <span className={`${styles.listItemBadge} ${styles[`listItemBadge--${item.status}`] || ""}`}>
                  {item.status === "in_progress" ? "En cours" : item.status === "published" ? "Publié" : item.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Members Card
   ═══════════════════════════════════════════════════════════════════════ */

function MembersCard({ members }: { members: MemberRecord[] }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle}>Membres Récents</h3>
          <p className={styles.cardSubtitle}>{members.length} inscrit(s)</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        {members.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3" /><path d="M9 21v-2a4 4 0 014-4h0" /><circle cx="17" cy="8" r="2.5" /><path d="M17 11c1.5 0 3 1 3 3v3" /></svg>
            </div>
            <p>Aucun membre enregistré</p>
          </div>
        ) : (
          members.map((m) => (
            <div key={m._id} className={styles.memberRow}>
              <div className={styles.memberAvatar}>
                {m.user.firstName[0]}{m.user.lastName[0]}
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>{m.user.firstName} {m.user.lastName}</div>
                <div className={styles.memberEmail}>{m.user.email}</div>
              </div>
              <span className={`${styles.memberBadge} ${m.status === "active" ? styles["memberBadge--active"] : styles["memberBadge--pending"]}`}>
                {m.status === "active" ? "Actif" : "En attente"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Dashboard
   ═══════════════════════════════════════════════════════════════════════ */

export function ClubLeaderDashboard() {
  const { user } = useAuth();
  const timer = useTimer();

  const { data: leaderClub, isLoading: clubsLoading, error: clubsError } = useQuery({
    queryKey: ["leader", "my-club"],
    queryFn: async () => {
      const res = await clubsService.getMyClub();
      return res.data;
    },
    enabled: !!user,
  });

  const clubId = leaderClub?._id;

  const { data, isLoading: dashboardLoading, error: dashboardError } = useClubLeaderDashboard(clubId);

  if (clubsLoading || dashboardLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingInner}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  if (clubsError || !leaderClub || dashboardError || !data) {
    const errMsg = (clubsError as any)?.error?.message || (dashboardError as any)?.error?.message || (dashboardError as any)?.message || "Aucun club assigné. Contactez l'administrateur.";
    return (
      <div className={styles.page}>
        <div className={styles.errorWrap}>
          <div className={styles.errorInner}>
            <div className={styles.errorIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h3 className={styles.errorTitle}>Erreur de chargement</h3>
            <p className={styles.errorMsg}>{errMsg}</p>
            <button className={styles.errorBtn} onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        </div>
      </div>
    );
  }

  const activeMembers = data.members.recentMemberships.filter((m) => m.status === "active").length;
  const formationsTerminees = data.kpis.formationsTerminees;
  const totalFormations = data.kpis.totalFormations;

  return (
    <div className={styles.page}>
      {/* ═══ Header ═══ */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.greeting}>Bonjour, {user?.firstName}</h1>
          <p className={styles.subtitle}>
            <span className={styles.subtitleDot} />
            Club : {leaderClub.name}
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerDate}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* ═══ Row 1: Stat Cards + Timer ═══ */}
      <div className={styles.row1}>
        {/* Formations */}
        <div className={styles.statCard} data-accent="emerald">
          <div className={styles.statTop}>
            <div className={`${styles.statIcon} ${styles["statIcon--emerald"]}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 19V5a2 2 0 012-2h9.5a1 1 0 01.8.4l3.1 4a1 1 0 01.1.6V19a2 2 0 01-2 2H6a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" /><path d="M9 12h4M9 16h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <span className={`${styles.statTrend} ${styles["statTrend--up"]}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              +{totalFormations}
            </span>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Total Formations</div>
            <div className={styles.statValue}>{totalFormations}</div>
            <div className={styles.statSecondary}>{formationsTerminees} terminées · {data.kpis.formationsEnCours} en cours</div>
          </div>
          <div className={styles.statFooter}>
            <Sparkline data={FORMATIONS_SPARKLINE} color="#059669" />
          </div>
        </div>

        {/* Membres */}
        <div className={styles.statCard} data-accent="blue">
          <div className={styles.statTop}>
            <div className={`${styles.statIcon} ${styles["statIcon--blue"]}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M4 19c0-3 2.5-5.5 5-5.5s5 2.5 5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="15.5" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.5" /><path d="M15.5 11.5c2 0 3.5 1.5 3.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <span className={`${styles.statTrend} ${styles["statTrend--up"]}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              +{activeMembers}
            </span>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Membres Actifs</div>
            <div className={styles.statValue}>{activeMembers}</div>
            <div className={styles.statSecondary}>{data.members.pendingRequests} en attente</div>
          </div>
          <div className={styles.statFooter}>
            <Sparkline data={MEMBERS_SPARKLINE} color="#3B82F6" />
          </div>
        </div>

        {/* Présences */}
        <div className={styles.statCard} data-accent="violet">
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
            <div className={styles.statLabel}>Présences Totales</div>
            <div className={styles.statValue}>{data.analytics.reduce((s: number, d: AnalyticsDay) => s + d.checkIns, 0)}</div>
            <div className={styles.statSecondary}>{data.kpis.inscriptionsEnAttente} inscriptions en attente</div>
          </div>
          <div className={styles.statFooter}>
            <Sparkline data={PRESENCES_SPARKLINE} color="#7C3AED" />
          </div>
        </div>

        {/* Caisse */}
        <div className={styles.statCard} data-accent={data.finance.balance >= 0 ? "emerald" : "rose"}>
          <div className={styles.statTop}>
            <div className={`${styles.statIcon} ${data.finance.balance >= 0 ? styles["statIcon--emerald"] : styles["statIcon--rose"]}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3 9h16" stroke="currentColor" strokeWidth="1.5" /><path d="M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <span className={`${styles.statTrend} ${data.finance.balance >= 0 ? styles["statTrend--up"] : styles["statTrend--down"]}`}>
              {data.finance.balance >= 0 ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 3v6M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
              {data.finance.balance >= 0 ? "Positif" : "Négatif"}
            </span>
          </div>
          <div className={styles.statBody}>
            <div className={styles.statLabel}>Solde du Club</div>
            <div className={styles.statValue}>{data.finance.balance.toLocaleString("fr-FR")}</div>
            <div className={styles.statSecondary}>TND · {data.finance.totalIncome.toLocaleString("fr-FR")} revenus</div>
          </div>
          <div className={styles.statFooter}>
            <Sparkline data={CAISSE_SPARKLINE} color={data.finance.balance >= 0 ? "#059669" : "#DC2626"} />
          </div>
        </div>

        {/* Timer */}
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2.5l9 5.5-9 5.5V2.5z" fill="currentColor" /></svg>
              )}
            </button>
            <button className={`${styles.timerBtn} ${styles.timerBtnReset}`} onClick={timer.reset}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1011.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Row 2: Chart + Finance + Activity ═══ */}
      <div className={styles.row2}>
        <PresenceChart data={data.analytics} />
        <FinanceCard finance={data.finance} />
        <ActivityCard />
      </div>

      {/* ═══ Row 3: Quick Actions ═══ */}
      <div className={styles.row3}>
        <a href="#events" className={styles.actionCard} data-action="emerald">
          <div className={`${styles.actionIcon} ${styles["actionIcon--emerald"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" /><path d="M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="12" r="1.5" fill="currentColor" /></svg>
          </div>
          <span className={styles.actionLabel}>Formations</span>
        </a>
        <a href="#members" className={styles.actionCard} data-action="blue">
          <div className={`${styles.actionIcon} ${styles["actionIcon--blue"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Membres</span>
        </a>
        <a href="#forms" className={styles.actionCard} data-action="violet">
          <div className={`${styles.actionIcon} ${styles["actionIcon--violet"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Formulaires</span>
        </a>
        <a href="#finance" className={styles.actionCard} data-action="amber">
          <div className={`${styles.actionIcon} ${styles["actionIcon--amber"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3 9h14" stroke="currentColor" strokeWidth="1.5" /></svg>
          </div>
          <span className={styles.actionLabel}>Caisse</span>
        </a>
        <a href="#reports" className={styles.actionCard} data-action="rose">
          <div className={`${styles.actionIcon} ${styles["actionIcon--rose"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 17V7l4-4 4 4 6-6v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Rapports</span>
        </a>
        <a href="#notifications" className={styles.actionCard} data-action="cyan">
          <div className={`${styles.actionIcon} ${styles["actionIcon--cyan"]}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M15 7a5 5 0 10-10 0c0 5-2.5 6.5-2.5 6.5h15S15 12 15 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M11.5 17a2 2 0 01-3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span className={styles.actionLabel}>Notifications</span>
        </a>
      </div>

      {/* ═══ Row 4: Upcoming + Members ═══ */}
      <div className={styles.row4}>
        <UpcomingCard items={data.upcoming} />
        <MembersCard members={data.members.recentMemberships} />
      </div>
    </div>
  );
}
