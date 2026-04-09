import HeaderPlayerInfos from "../components/HeaderPlayerInfos.tsx";
import StatsCards from "../components/StatsCards.tsx";
import EloGraph from "../components/EloGraph.tsx";
import LastMatches from "../components/LastMatches.tsx";
import DailyPuzzle from "../components/DailyPuzzle.tsx";
import Achievement from "../components/Achievement.tsx";
import LeaderBoard from "../components/LeaderBoard.tsx";

import { useEffect, useState } from "react";
import * as api from '../api/api.ts';

function Dashboard() {
    const [user, setUser] = useState(null);
    useEffect(() => {
            async function fetchUser() {
                const userData = await api.userStats();
                setUser(userData);
                console.log(userData);
            };
            fetchUser();
        }, []);

    return (
        <div className="border rounded-md bg-white text-black h-full">
            <HeaderPlayerInfos user={user} setUser={setUser}/>
            <section className="m-4 grid grid-cols-4 gap-6">
                <StatsCards user={user}/>
                <EloGraph user={user}/>
                <LastMatches user={user}/>
                <LeaderBoard />
                <DailyPuzzle />
                <Achievement />
            </section>
        </div>
    );
}

export default Dashboard;