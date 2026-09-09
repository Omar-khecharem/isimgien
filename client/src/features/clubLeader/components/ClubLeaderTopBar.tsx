import { useAuth } from "../../../features/auth";
import { Bell, MessageSquare, Menu } from "lucide-react";

interface ClubLeaderTopBarProps {
  onMenuClick: () => void;
}

export function ClubLeaderTopBar({ onMenuClick }: ClubLeaderTopBarProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="flex items-start sm:items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 flex-shrink-0"
            >
              <Menu className="w-[18px] h-[18px]" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                Dashboard Associatif
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                Gérez votre club, organisez vos formations et suivez les présences en temps réel.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button className="bg-brand text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-brand-light transition-colors hidden sm:block">
            + Créer une Formation
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-gray-50 transition-colors hidden md:block">
            Exporter les données
          </button>

          {/* Icons */}
          <button className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <MessageSquare className="w-[18px] h-[18px]" />
          </button>
          <button className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand text-xs sm:text-sm font-bold flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-400">Club Leader</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
