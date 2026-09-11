import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth";
import { ROUTES } from "../../../routes/paths";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  UserCheck,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  X,
  Bell,
  FileText,
  BarChart3,
  Building2,
} from "lucide-react";

const MENU_ITEMS = [
  { to: ROUTES.LEADER_HOME, label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/leader/profile", label: "Mon Club", icon: Building2 },
  { to: ROUTES.LEADER_CLUBS, label: "Clubs", icon: CalendarDays, badge: "12" },
  { to: ROUTES.LEADER_FORMS, label: "Formulaires & Inscriptions", icon: ClipboardList },
  { to: ROUTES.LEADER_MEMBERS, label: "Membres & Présences", icon: UserCheck },
  { to: ROUTES.LEADER_FINANCE, label: "Caisse & Cotisations", icon: Wallet },
  { to: ROUTES.LEADER_REPORTS, label: "Rapports & Stats", icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { to: ROUTES.LEADER_NOTIFICATIONS, label: "Notifications", icon: Bell, badge: "3" },
  { to: ROUTES.LEADER_DOCUMENTS, label: "Documents", icon: FileText },
  { to: ROUTES.LEADER_SETTINGS, label: "Paramètres", icon: Settings },
  { to: ROUTES.LEADER_HELP, label: "Aide & Support", icon: HelpCircle },
];

interface ClubLeaderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClubLeaderSidebar({ isOpen, onClose }: ClubLeaderSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[260px] bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-5 h-16 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white text-xs font-bold">IS</span>
            </div>
            <div>
              <span className="text-[14px] font-bold text-gray-900 block leading-tight">ISIMGIEN</span>
              <span className="text-[10px] font-medium text-gray-400">Club Leader</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full h-9 pl-9 pr-4 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
            />
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-1 overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">
            Navigation
          </div>
          <div className="flex flex-col gap-0.5">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-brand-50 text-brand border-l-[3px] border-brand pl-[9px]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 py-2 border-t border-gray-100 flex-shrink-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">
            Général
          </div>
          <div className="flex flex-col gap-0.5">
            {BOTTOM_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-brand-50 text-brand"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full text-left"
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
