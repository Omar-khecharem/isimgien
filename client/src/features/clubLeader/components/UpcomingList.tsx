import { useMemo } from "react";
import { Plus, ArrowRight, Calendar } from "lucide-react";
import type { UpcomingTraining } from "../clubLeaderService";

interface UpcomingListProps {
  items: UpcomingTraining[];
}

export function UpcomingList({ items }: UpcomingListProps) {
  const now = useMemo(() => new Date(), []);
  const todayStr = now.toDateString();
  const tomorrowStr = new Date(now.getTime() + 86400000).toDateString();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <span className="text-[11px] font-bold text-brand bg-brand-50 px-2.5 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 transition-colors group">
            Tout voir
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="flex items-center gap-1.5 bg-brand text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-brand/90 active:scale-[0.97] transition-all duration-150 shadow-sm shadow-brand/20">
            <Plus className="w-3.5 h-3.5" />
            Nouveau
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-xs font-medium text-gray-400 text-center">
              Aucune formation prévue
            </p>
            <p className="text-[10px] text-gray-300 mt-1">
              Créez votre prochaine formation
            </p>
          </div>
        ) : (
          items.map((item) => {
            const date = new Date(item.date);
            const day = date.getDate();
            const month = date.toLocaleDateString("fr-FR", { month: "short" });
            const isToday = todayStr === date.toDateString();
            const isTomorrow = tomorrowStr === date.toDateString();

            return (
              <div
                key={item._id}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isToday
                    ? "bg-gradient-to-br from-brand to-emerald-700 shadow-lg shadow-brand/20"
                    : isTomorrow
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20"
                    : "bg-white border border-gray-200"
                }`}>
                  <span className={`text-base font-bold leading-none ${
                    isToday || isTomorrow ? "text-white" : "text-gray-900"
                  }`}>
                    {day}
                  </span>
                  <span className={`text-[9px] font-semibold uppercase leading-none mt-1 ${
                    isToday || isTomorrow ? "text-white/70" : "text-gray-400"
                  }`}>
                    {month}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                      {item.title}
                    </div>
                    {isToday && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand text-white whitespace-nowrap">
                        Aujourd'hui
                      </span>
                    )}
                    {isTomorrow && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white whitespace-nowrap">
                        Demain
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate mt-1">
                    {item.startTime} — {item.endTime} · {item.location}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${
                    item.status === "in_progress"
                      ? "bg-blue-50 text-blue-600"
                      : item.status === "published"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.status === "in_progress" ? "En cours" : item.status === "published" ? "Publié" : item.status.replace(/_/g, " ")}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
