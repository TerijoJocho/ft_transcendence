import HeaderPlayerInfos from "../components/HeaderPlayerInfos.tsx";
import StatsCards from "../components/StatsCards.tsx";
import EloGraph from "../components/EloGraph.tsx";
import LastMatches from "../components/LastMatches.tsx";
import DailyPuzzle from "../components/DailyPuzzle.tsx";
import LeaderBoard from "../components/LeaderBoard.tsx";
import type { UserStatsResponse } from "../api/api.ts";

import { useEffect, useState } from "react";
import * as api from "../api/api.ts";

function Dashboard() {
  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await api.userStats();
        setUserStats(userData);
      } catch (error) {
        console.error(error);
      }
    }

    fetchUser();
  }, []);

  return (
    <div className="border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white h-full transition-colors duration-300">
      <HeaderPlayerInfos userStats={userStats} setUserStats={setUserStats} />
      <section className="m-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
