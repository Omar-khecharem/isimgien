import { useState } from "react";
import { useAuth } from "../../features/auth";
import { useClubLeaderDashboard } from "./useClubLeaderDashboard";
import { clubsService } from "../clubs/clubsService";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "../../components/ui";
import { ClubLeaderSidebar } from "./components/ClubLeaderSidebar";
import { ClubLeaderTopBar } from "./components/ClubLeaderTopBar";
import { KpiCards } from "./components/KpiCards";
import { AttendanceChart } from "./components/AttendanceChart";
import { NextTrainingCard } from "./components/NextTrainingCard";
import { UpcomingList } from "./components/UpcomingList";
import { MembersTable } from "./components/MembersTable";
import { FinanceGauge } from "./components/FinanceGauge";
import { SessionTimerWidget } from "./components/SessionTimerWidget";

export function ClubLeaderDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: clubsData } = useQuery({
    queryKey: ["leader", "clubs"],
    queryFn: async () => {
      const res = await clubsService.list({ limit: 50 });
      return res.data.filter(
        (c) => c.leader?._id === user?.id || user?.role === "super_admin"
      );
    },
    enabled: !!user,
  });

  const leaderClub = clubsData?.[0];
  const clubId = leaderClub?._id;

  const { data, isLoading } = useClubLeaderDashboard(clubId);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4F6F8]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6F8]">
      <ClubLeaderSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        <ClubLeaderTopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col gap-4 sm:gap-5 lg:gap-6">
          {/* Row 1: KPIs */}
          <KpiCards kpis={data.kpis} />

          {/* Row 2: Chart, Next Training, Upcoming */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AttendanceChart data={data.analytics} />
            {data.nextTraining ? (
              <NextTrainingCard training={data.nextTraining} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-center">
                <p className="text-sm text-gray-400">Aucune formation prévue</p>
              </div>
            )}
            <UpcomingList items={data.upcoming} />
          </div>

          {/* Row 3: Members, Finance Gauge, Timer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <MembersTable members={data.members.recentMemberships} />
            <FinanceGauge finance={data.finance} />
            <SessionTimerWidget session={data.activeSession} />
          </div>
        </main>
      </div>
    </div>
  );
}
