import { Clock, UserPlus, CheckCircle, Calendar, FileText, ArrowRight, TrendingUp } from "lucide-react";

const ACTIVITIES = [
  {
    id: "1",
    icon: UserPlus,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Nouveau membre rejoint",
    description: "Ahmed Benali a rejoint le club",
    time: "Il y a 12 min",
    dot: "bg-blue-500",
  },
  {
    id: "2",
    icon: CheckCircle,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Formation terminée",
    description: "Initiation à la photographie — 18 présents",
    time: "Il y a 2h",
    dot: "bg-emerald-500",
  },
  {
    id: "3",
    icon: Calendar,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "Formation planifiée",
    description: "Workshop Design Graphique — 15 Sept",
    time: "Il y a 3h",
    dot: "bg-violet-500",
  },
  {
    id: "4",
    icon: FileText,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Formulaire soumis",
    description: "3 nouvelles réponses au formulaire d'inscription",
    time: "Il y a 5h",
    dot: "bg-amber-500",
  },
  {
    id: "5",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Paiement reçu",
    description: "Cotisation de Sarah Meziane — 2 000 TND",
    time: "Hier",
    dot: "bg-emerald-500",
  },
];

export function ActivityFeed() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
          Activité Récente
        </h3>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 transition-colors group">
          Tout voir
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="flex flex-col relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gray-100" />

        {ACTIVITIES.map((activity, i) => (
          <div
            key={activity.id}
            className={`relative flex items-start gap-3.5 py-3.5 ${
              i < ACTIVITIES.length - 1 ? "" : ""
            }`}
          >
            {/* Timeline dot */}
            <div className={`relative z-10 w-[11px] h-[11px] rounded-full ${activity.dot} ring-[3px] ring-white flex-shrink-0 mt-[7px]`} />

            <div className={`w-9 h-9 rounded-xl ${activity.iconBg} flex items-center justify-center flex-shrink-0`}>
              <activity.icon className={`w-[18px] h-[18px] ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                {activity.title}
              </div>
              <div className="text-[11px] text-gray-400 truncate mt-0.5 leading-relaxed">
                {activity.description}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
              <Clock className="w-3 h-3 text-gray-300" />
              <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
