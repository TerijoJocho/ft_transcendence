import HeaderPlayerInfos from "../components/HeaderPlayerInfos.tsx";
import StatsCards from "../components/StatsCards.tsx";
import EloGraph from "../components/EloGraph.tsx";
import LastMatches from "../components/LastMatches.tsx";
import DailyPuzzle from "../components/DailyPuzzle.tsx";
import LeaderBoard from "../components/LeaderBoard.tsx";
import { mockDashboardUserStats } from "../data/mock_data";//mock
import type { DashboardUserStats } from "../data/mock_data";//mock
import USE_MOCK_DATA from "../config/dataConfig";//mock
import type { UserStatsResponse } from "../api/api.ts";

import { useEffect, useState } from "react";
import * as api from "../api/api.ts";

function Dashboard() {
  const [userStats, setUserStats] = useState<UserStatsResponse | DashboardUserStats | null>(null);
  useEffect(() => {
    try {
      async function fetchUser() {
        const userData = USE_MOCK_DATA
          ? mockDashboardUserStats
          : await api.userStats();
        setUserStats(userData);
      }
      fetchUser();
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="border rounded-md bg-white text-black h-full">
      <HeaderPlayerInfos userStats={userStats} setUserStats={setUserStats} />
      <section className="m-4 grid grid-cols-4 gap-6">
        <StatsCards userStats={userStats} />
        <EloGraph />
        <LastMatches userStats={userStats} />
        <LeaderBoard />
        <DailyPuzzle />
      </section>
    </div>
  );
}

export default Dashboard;
