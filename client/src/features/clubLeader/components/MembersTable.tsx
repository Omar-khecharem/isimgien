import { Plus, ArrowRight, Search } from "lucide-react";
import type { MemberRecord } from "../clubLeaderService";

interface MembersTableProps {
  members: MemberRecord[];
  totalMembers: number;
}

export function MembersTable({ members, totalMembers: _totalMembers }: MembersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {members.length > 0 && (
            <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {members.length}
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
            Ajouter
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un membre..."
          className="w-full h-10 pl-10 pr-4 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-200"
        />
      </div>

      <div className="flex flex-col">
        {members.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-400 text-center">
              Aucun membre enregistré
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <div className="col-span-6">Membre</div>
              <div className="col-span-3 text-center">Statut</div>
              <div className="col-span-3 text-right">Inscription</div>
            </div>

            {members.map((m) => (
              <div
                key={m._id}
                className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 cursor-pointer group"
              >
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand/10 to-emerald-500/10 flex items-center justify-center text-brand text-[10px] font-bold flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    {m.user.firstName[0]}{m.user.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                      {m.user.firstName} {m.user.lastName}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate mt-0.5">
                      {m.user.email}
                    </div>
                  </div>
                </div>
                <div className="col-span-3 flex justify-center">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
                      m.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : m.status === "pending"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {m.status === "active" ? "Actif" : m.status === "pending" ? "En attente" : m.status}
                  </span>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
