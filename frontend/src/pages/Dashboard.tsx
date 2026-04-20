import HeaderPlayerInfos from "../components/HeaderPlayerInfos.tsx";
import StatsCards from "../components/StatsCards.tsx";
import EloGraph from "../components/EloGraph.tsx";
import LastMatches from "../components/LastMatches.tsx";
import DailyPuzzle from "../components/DailyPuzzle.tsx";
// import LeaderBoard from "../components/LeaderBoard.tsx";
import { mockDashboardUserStats } from "../data/mock_data";
import USE_MOCK_DATA from "../config/dataConfig";

import { useEffect, useState } from "react";
import * as api from "../api/api.ts";

function Dashboard() {
  const [userStats, setUserStats] = useState(null);
  useEffect(() => {
    try {
      async function fetchUser() {
        const userData = USE_MOCK_DATA
          ? mockDashboardUserStats
          : await api.userStats();
        setUserStats(userData);
        console.log(userData);
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
        {/* <LeaderBoard /> */}
        <DailyPuzzle />
      </section>
    </div>
  );
}

export default Dashboard;
