import { Pause, Square } from "lucide-react";
import { SessionTimer } from "../../attendance/components/SessionTimer";
import type { ActiveSession } from "../clubLeaderService";

interface SessionTimerWidgetProps {
  session: ActiveSession | null;
}

export function SessionTimerWidget({ session }: SessionTimerWidgetProps) {
  if (!session) {
    return (
      <div className="bg-brand rounded-2xl p-4 sm:p-5 h-full flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 sm:mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="text-xs sm:text-sm font-medium text-white/70">
          Aucune session active
        </p>
        <p className="text-[11px] sm:text-xs text-white/50 mt-1">
          Démarrez une formation pour lancer le chronomètre
        </p>
      </div>
    );
  }

  const startTime = session.training.date + "T" + session.training.startTime;

  return (
    <div className="bg-brand rounded-2xl p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-[11px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider">
          Session Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-medium text-emerald-300">En cours</span>
        </span>
      </div>

      <h3 className="text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2 leading-snug">
        {session.training.title}
      </h3>
      <p className="text-[11px] sm:text-xs text-white/60 mb-3 sm:mb-4">
        {session.training.location}
      </p>

      <div className="text-center mb-4 sm:mb-5">
        <div className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-wider">
          <SessionTimer startTime={startTime} isActive={true} />
        </div>
        <p className="text-[11px] sm:text-xs text-white/50 mt-1">Durée écoulée</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 sm:mb-5">
        <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-lg sm:text-xl font-bold text-white">{session.checkedIn}</div>
          <div className="text-[9px] sm:text-[10px] text-white/60">Présents</div>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-lg sm:text-xl font-bold text-white">{session.checkedOut}</div>
          <div className="text-[9px] sm:text-[10px] text-white/60">Sortis</div>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-lg sm:text-xl font-bold text-white">{session.incomplete}</div>
          <div className="text-[9px] sm:text-[10px] text-white/60">Incomplets</div>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5 sm:p-3 text-center">
          <div className="text-lg sm:text-xl font-bold text-white">{session.total}</div>
          <div className="text-[9px] sm:text-[10px] text-white/60">Total</div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-center gap-3">
        <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-colors">
          <Square className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
