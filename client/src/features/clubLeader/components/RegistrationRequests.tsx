import { Check, X, ArrowRight } from "lucide-react";
import type { RegistrationRecord } from "../clubLeaderService";

interface RegistrationRequestsProps {
  registrations: RegistrationRecord[];
}

export function RegistrationRequests({ registrations }: RegistrationRequestsProps) {
  const pendingRegistrations = registrations.filter((r) => r.status === "pending");
  const displayItems = pendingRegistrations.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Inscriptions en attente
          </h3>
          {pendingRegistrations.length > 0 && (
            <span className="min-w-[20px] h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
              {pendingRegistrations.length}
            </span>
          )}
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 transition-colors group">
          Tout voir
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <Check className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-xs font-medium text-gray-400 text-center">
            Aucune inscription en attente
          </p>
          <p className="text-[10px] text-gray-300 mt-1">Tout est à jour</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayItems.map((reg) => (
            <div
              key={reg._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {reg.user.firstName[0]}{reg.user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                  {reg.user.firstName} {reg.user.lastName}
                </div>
                <div className="text-[11px] text-gray-400 truncate mt-0.5">
                  {reg.targetType === "training" ? "Formation" : "Événement"}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 hover:scale-110 active:scale-95 transition-all duration-150">
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <button className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all duration-150">
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
