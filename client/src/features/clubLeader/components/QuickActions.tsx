import { CalendarPlus, UserPlus, FileSpreadsheet, Wallet, BarChart3, Send } from "lucide-react";

interface QuickActionsProps {
  clubId?: string;
}

const ACTIONS = [
  { label: "Créer Formation", icon: CalendarPlus, href: "#events", gradient: "from-[#0A5F3A] to-emerald-700", shadow: "shadow-brand/20" },
  { label: "Inviter Membre", icon: UserPlus, href: "#members", gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
  { label: "Créer Formulaire", icon: FileSpreadsheet, href: "#forms", gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20" },
  { label: "Ajouter Transaction", icon: Wallet, href: "#finance", gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
  { label: "Voir Rapports", icon: BarChart3, href: "#reports", gradient: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/20" },
  { label: "Notifier", icon: Send, href: "#notifications", gradient: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/20" },
];

export function QuickActions({ clubId: _clubId }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
      {ACTIONS.map((action) => (
        <a
          key={action.label}
          href={action.href}
          className="group flex flex-col items-center gap-2.5 p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 active:scale-[0.97]"
        >
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg ${action.shadow} transition-all duration-300`}>
            <action.icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 group-hover:text-gray-900 transition-colors text-center leading-tight">
            {action.label}
          </span>
        </a>
      ))}
    </div>
  );
}
