import { Plus } from "lucide-react";
import type { UpcomingTraining } from "../clubLeaderService";

interface UpcomingListProps {
  items: UpcomingTraining[];
}

export function UpcomingList({ items }: UpcomingListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          À venir
        </h3>
        <button className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-brand hover:text-brand-light transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Nouveau
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-400 text-center py-6">
            Aucun événement à venir
          </p>
        ) : (
          items.map((item) => {
            const date = new Date(item.date);
            const day = date.getDate();
            const month = date.toLocaleDateString("fr-FR", { month: "short" });

            return (
              <div
                key={item._id}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-50 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-brand leading-none">
                    {day}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-semibold text-brand uppercase leading-none mt-0.5">
                    {month}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-400 truncate">
                    {item.startTime} — {item.endTime} · {item.location}
                  </div>
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${
                    item.status === "in_progress"
                      ? "bg-blue-50 text-blue-600"
                      : item.status === "published"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.status.replace(/_/g, " ")}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
