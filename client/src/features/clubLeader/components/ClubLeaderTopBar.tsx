import { useAuth } from "../../../features/auth";
import { Bell, Menu, Search, ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClubLeaderTopBarProps {
  onMenuClick: () => void;
}

export function ClubLeaderTopBar({ onMenuClick }: ClubLeaderTopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:scale-95 transition-all duration-150 flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-0.5">
              <span className="font-medium">Tableau de bord</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600 font-semibold">Accueil</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate leading-tight">
              {greeting}, <span className="text-brand">{user?.firstName}</span>
            </h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Search */}
          <div className="hidden lg:flex items-center relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-56 h-10 pl-10 pr-4 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 active:scale-95 transition-all duration-150">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 hidden sm:block" />

          {/* Profile */}
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-brand/20">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-semibold text-gray-900 leading-tight">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[11px] text-gray-400 leading-tight">Club Leader</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all duration-150"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
