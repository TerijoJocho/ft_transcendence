import HeaderPlayerInfos from "../components/HeaderPlayerInfos.tsx";
import StatsCards from "../components/statsCards.tsx";
import EloGraph from "../components/EloGraph.tsx";
import LastMatches from "../components/LastMatches.tsx";
import TournamentHistory from "../components/TournamentHistory.tsx";
import DailyPuzzle from "../components/DailyPuzzle.tsx";

function Dashboard() {
    return (
        <div className="border rounded-md bg-white text-black">
            <HeaderPlayerInfos />
            <section className="m-4 grid grid-cols-2 gap-6">
                <StatsCards />
                <EloGraph />
                <LastMatches />
                <TournamentHistory />
                <DailyPuzzle />
            </section>
        </div>
    );
}

export default Dashboard;