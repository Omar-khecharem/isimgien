import { Plus } from "lucide-react";
import type { MemberRecord } from "../clubLeaderService";

interface MembersTableProps {
  members: MemberRecord[];
}

export function MembersTable({ members }: MembersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          Membres Récents
        </h3>
        <button className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-brand hover:text-brand-light transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        {members.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-400 text-center py-6">
            Aucun membre enregistré
          </p>
        ) : (
          members.map((m) => (
            <div
              key={m._id}
              className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand text-[10px] sm:text-xs font-bold flex-shrink-0">
                {m.user.firstName[0]}
                {m.user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {m.user.firstName} {m.user.lastName}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 truncate">
                  {m.user.email}
                </div>
              </div>
              <span
                className={`text-[9px] sm:text-[10px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                  m.status === "active"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {m.status === "active" ? "Actif" : "En attente"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
