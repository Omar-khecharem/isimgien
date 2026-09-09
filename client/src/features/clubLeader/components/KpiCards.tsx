import { TrendingUp, BookOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { DashboardKpis } from "../clubLeaderService";

interface KpiCardsProps {
  kpis: DashboardKpis;
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards = [
    {
      label: "Total Formations",
      value: kpis.totalFormations,
      trend: "+12%",
      accent: true,
      icon: BookOpen,
    },
    {
      label: "Formations Terminées",
      value: kpis.formationsTerminees,
      trend: "Complété",
      accent: false,
      icon: CheckCircle2,
      trendColor: "text-emerald-600",
    },
    {
      label: "Formations En Cours",
      value: kpis.formationsEnCours,
      trend: "Actif",
      accent: false,
      icon: Clock,
      trendColor: "text-blue-600",
    },
    {
      label: "Inscriptions En Attente",
      value: kpis.inscriptionsEnAttente,
      trend: "En attente",
      accent: false,
      icon: AlertCircle,
      trendColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl p-4 sm:p-5 ${
            card.accent
              ? "bg-brand text-white"
              : "bg-white border border-gray-100 text-gray-900"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs sm:text-sm font-medium ${
                card.accent ? "text-brand-200" : "text-gray-500"
              }`}
            >
              {card.label}
            </span>
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${
                card.accent ? "bg-white/15" : "bg-gray-50"
              }`}
            >
              <card.icon
                className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${
                  card.accent ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl sm:text-3xl font-bold leading-none">
              {card.value}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {card.accent && <TrendingUp className="w-3.5 h-3.5 text-brand-200" />}
            <span
              className={`text-[11px] sm:text-xs font-semibold ${
                card.accent
                  ? "text-brand-200"
                  : card.trendColor || "text-gray-500"
              }`}
            >
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
