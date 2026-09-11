import { BookOpen, CheckCircle2, Clock, AlertCircle, Users, TrendingUp, TrendingDown } from "lucide-react";
import type { DashboardKpis, MemberRecord, FinanceSummary } from "../clubLeaderService";

interface KpiCardsProps {
  kpis: DashboardKpis;
  members: { recentMemberships: MemberRecord[]; pendingRequests: number };
  finance: FinanceSummary;
}

export function KpiCards({ kpis, members, finance }: KpiCardsProps) {
  const attendanceRate = kpis.formationsTerminees > 0
    ? Math.round((kpis.formationsTerminees / Math.max(kpis.totalFormations, 1)) * 100)
    : 0;

  const activeMembers = members.recentMemberships.filter(m => m.status === "active").length;

  const cards = [
    {
      label: "Total Formations",
      value: kpis.totalFormations,
      subtitle: `${kpis.formationsTerminees} terminées`,
      icon: BookOpen,
      gradient: "from-[#0A5F3A] to-emerald-700",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Taux de Complétion",
      value: `${attendanceRate}%`,
      subtitle: "Formations terminées",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      trend: attendanceRate > 50 ? "Bon" : "À améliorer",
      trendUp: attendanceRate > 50,
    },
    {
      label: "Membres Actifs",
      value: activeMembers,
      subtitle: `${members.pendingRequests} en attente`,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Solde du Club",
      value: `${finance.balance.toLocaleString("fr-FR")} TND`,
      subtitle: `${finance.totalIncome.toLocaleString("fr-FR")} TND revenus`,
      icon: finance.balance >= 0 ? TrendingUp : TrendingDown,
      gradient: finance.balance >= 0 ? "from-violet-500 to-purple-600" : "from-red-500 to-rose-600",
      trend: finance.balance >= 0 ? "Positif" : "Négatif",
      trendUp: finance.balance >= 0,
    },
  ];

  const secondaryCards = [
    { label: "En Cours", value: kpis.formationsEnCours, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100/80" },
    { label: "En Attente", value: kpis.inscriptionsEnAttente, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100/80" },
    { label: "Revenus", value: `${(finance.totalIncome / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100/80" },
    { label: "Dépenses", value: `${(finance.totalExpenses / 1000).toFixed(0)}k`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50", border: "border-red-100/80" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`group rounded-2xl bg-gradient-to-br ${card.gradient} p-5 relative overflow-hidden hover:shadow-lg hover:shadow-brand/10 transition-all duration-300 cursor-default`}
          >
            {/* Decorative circles */}
            <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full bg-white/[0.06] group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -right-1 -bottom-8 w-20 h-20 rounded-full bg-white/[0.04]" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/[0.12] backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <card.icon className="w-[18px] h-[18px] text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-[28px] font-bold text-white leading-none tracking-tight">
                {card.value}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-white/60">
                  {card.subtitle}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  card.trendUp ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
                }`}>
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {secondaryCards.map((card) => (
          <div
            key={card.label}
            className={`group rounded-xl ${card.bg} border ${card.border} p-3.5 hover:shadow-sm transition-all duration-200 cursor-default`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                <card.icon className={`w-[18px] h-[18px] ${card.color}`} />
              </div>
              <div className="min-w-0">
                <div className={`text-lg sm:text-xl font-bold ${card.color} leading-none tracking-tight`}>
                  {card.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate font-medium">
                  {card.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
