import { Pause, Square, MapPin } from "lucide-react";
import { SessionTimer } from "../../attendance/components/SessionTimer";
import type { ActiveSession } from "../clubLeaderService";

interface SessionTimerWidgetProps {
  session: ActiveSession | null;
}

export function SessionTimerWidget({ session }: SessionTimerWidgetProps) {
  if (!session) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[240px] relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-4 mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white/70 mb-1">
            Aucune session active
          </p>
          <p className="text-[11px] text-white/35 max-w-[200px] leading-relaxed">
            Démarrez une formation pour lancer le chronomètre
          </p>
        </div>
      </div>
    );
  }

  const startTime = session.training.date + "T" + session.training.startTime;
  const attendanceRate = session.total > 0 ? Math.round((session.checkedIn / session.total) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-[#0A5F3A] via-emerald-700 to-[#0A5F3A] rounded-2xl p-5 sm:p-6 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/[0.05]" />
      <div className="absolute -right-3 -bottom-10 w-24 h-24 rounded-full bg-white/[0.04]" />
      <div className="absolute left-0 top-0 w-full h-full opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
            Session Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">En cours</span>
          </span>
        </div>

        <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">
          {session.training.title}
        </h3>
        <div className="flex items-center gap-1.5 mb-4">
          <MapPin className="w-3.5 h-3.5 text-white/40" />
          <p className="text-[11px] text-white/45">
            {session.training.location}
          </p>
        </div>

        {/* Timer */}
        <div className="text-center mb-5 py-4 bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.06]">
          <div className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-wider leading-none">
            <SessionTimer startTime={startTime} isActive={true} />
          </div>
          <p className="text-[10px] text-white/35 mt-2 font-medium uppercase tracking-wider">Durée écoulée</p>
        </div>

        {/* Attendance Rate */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-white/50 font-medium">Taux de présence</span>
            <span className="text-[11px] font-bold text-white">{attendanceRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { value: session.checkedIn, label: "Présents" },
            { value: session.checkedOut, label: "Sortis" },
            { value: session.incomplete, label: "Incomplets" },
            { value: session.total, label: "Total" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.08] backdrop-blur-sm rounded-xl p-3 text-center border border-white/[0.05]">
              <div className="text-xl font-bold text-white leading-none">{stat.value}</div>
              <div className="text-[9px] text-white/40 mt-1 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] text-white text-xs font-semibold transition-all duration-200 backdrop-blur-sm border border-white/[0.08] active:scale-[0.97]">
            <Pause className="w-4 h-4" />
            Pause
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold transition-all duration-200 shadow-lg shadow-red-500/25 active:scale-[0.97]">
            <Square className="w-4 h-4" />
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
}
