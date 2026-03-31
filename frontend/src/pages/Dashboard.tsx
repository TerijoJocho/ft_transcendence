import HeaderPlayerInfos from "../components/HeaderPlayerInfos.tsx";
import StatsCards from "../components/StatsCards.tsx";
import EloGraph from "../components/EloGraph.tsx";
import LastMatches from "../components/LastMatches.tsx";
// import TournamentHistory from "../components/TournamentHistory.tsx";
import DailyPuzzle from "../components/DailyPuzzle.tsx";
import Achievement from "../components/Achievement.tsx";
import LeaderBoard from "../components/LeaderBoard.tsx";

function Dashboard() {
    return (
        <div className="border rounded-md bg-white text-black h-full">
            <HeaderPlayerInfos />
            <section className="m-4 grid grid-cols-4 gap-6">
                <StatsCards />
                <EloGraph />
                <LastMatches />
                <LeaderBoard />
                <DailyPuzzle />
                <Achievement />
            </section>
        </div>
    );
}

export default Dashboard;