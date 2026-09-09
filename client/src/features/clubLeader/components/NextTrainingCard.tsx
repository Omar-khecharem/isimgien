import { MapPin, Clock, CalendarDays } from "lucide-react";
import type { NextTraining } from "../clubLeaderService";

interface NextTrainingCardProps {
  training: NextTraining;
}

export function NextTrainingCard({ training }: NextTrainingCardProps) {
  const formattedDate = new Date(training.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-brand bg-brand-50 px-2.5 py-1 rounded-full">
          Prochaine Formation
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-gray-500">
          {training.registrationCount} inscrits
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 leading-snug">
        {training.title}
      </h3>

      <div className="flex flex-col gap-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="capitalize">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>
            {training.startTime} — {training.endTime}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{training.location}</span>
        </div>
      </div>

      <button className="mt-auto w-full bg-brand text-white text-sm font-semibold py-2.5 sm:py-3 rounded-xl hover:bg-brand-light transition-colors">
        Lancer le Check-in
      </button>
    </div>
  );
}
