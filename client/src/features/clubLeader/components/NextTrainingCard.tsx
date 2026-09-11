import { useMemo } from "react";
import { MapPin, Clock, CalendarDays, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/paths";
import type { NextTraining } from "../clubLeaderService";

interface NextTrainingCardProps {
  training: NextTraining;
}

export function NextTrainingCard({ training }: NextTrainingCardProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(training.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const now = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(now.getTime() + 86400000), [now]);
  const isToday = now.toDateString() === new Date(training.date).toDateString();
  const isTomorrow = tomorrow.toDateString() === new Date(training.date).toDateString();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-50 px-3 py-1 rounded-full">
          Prochaine Formation
        </span>
        {isToday && (
          <span className="text-[10px] font-bold text-white bg-brand px-2.5 py-0.5 rounded-full animate-pulse shadow-sm shadow-brand/30">
            Aujourd'hui
          </span>
        )}
        {isTomorrow && (
          <span className="text-[10px] font-bold text-white bg-blue-500 px-2.5 py-0.5 rounded-full shadow-sm shadow-blue-500/30">
            Demain
          </span>
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 leading-snug tracking-tight">
        {training.title}
      </h3>

      <div className="flex flex-col gap-2.5 mb-5 flex-1">
        {[
          { icon: CalendarDays, text: formattedDate, capitalize: true },
          { icon: Clock, text: `${training.startTime} — ${training.endTime}` },
          { icon: MapPin, text: training.location },
          { icon: Users, text: `${training.registrationCount} inscrits`, highlight: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-[13px] text-gray-600">
            <item.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={item.capitalize ? "capitalize" : ""}>
              {item.highlight ? (
                <span className="font-semibold text-brand">{item.text}</span>
              ) : (
                item.text
              )}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(ROUTES.ATTENDANCE.replace(":clubId", "").replace(":trainingId", training._id))}
        className="w-full bg-gradient-to-r from-brand to-emerald-700 text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        Lancer le Check-in
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
