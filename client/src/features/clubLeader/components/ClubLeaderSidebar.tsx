import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth";
import { ROUTES } from "../../../routes/paths";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  UserCheck,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";

const MENU_ITEMS = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: "#events", label: "Événements & Formations", icon: CalendarDays },
  { to: "#club", label: "Gestion du Club", icon: Users },
  { to: "#forms", label: "Formulaires & Inscriptions", icon: ClipboardList },
  { to: "#members", label: "Membres & Présences", icon: UserCheck },
  { to: "#finance", label: "Caisse & Cotisations", icon: Wallet },
];

const BOTTOM_ITEMS = [
  { to: "#settings", label: "Paramètres", icon: Settings },
  { to: "#help", label: "Aide & Support", icon: HelpCircle },
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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={() => onClose()}
        className="fixed top-4 left-4 z-[60] lg:hidden w-10 h-10 bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[260px] bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo + close */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-brand">ISIMGIEN</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full h-9 pl-9 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 hidden sm:inline">
              ⌘F
            </kbd>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">
            Menu
          </div>
          <div className="flex flex-col gap-0.5">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
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
        <div className="px-3 py-2 border-t border-gray-100">
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
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-brand-50 text-brand"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 w-full text-left"
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* CTA Card */}
        <div className="mx-3 mb-3 hidden sm:block">
          <div className="bg-brand rounded-2xl p-4">
            <p className="text-xs font-semibold text-white mb-1">
              Accès rapide ISIMGIEN
            </p>
            <p className="text-[11px] text-brand-200 mb-3 leading-relaxed">
              Consultez vos cotisations et vos attestations de présence.
            </p>
            <button className="w-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
              Mon Profil Étudiant
            </button>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
