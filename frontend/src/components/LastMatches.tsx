import { mockDashboardUserStats, type DashboardMatch } from "../data/mock_data";

function formatGameDuration(duration) {
  if (typeof duration !== "string") return "-";

  const [hoursStr, minutesStr, secondStr] = duration.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const seconds = Number(secondStr);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return duration;
  }

  if (hours > 0) {
    return `${hours}h${minutes}min${seconds}s`;
  }

  if (minutes > 0) return `${minutes}min${seconds}s`;

  return `${seconds}s`;
}

export default function LastMatches({ user: _user }) {
  console.log(_user);
  // display match history items
  // const displayData = (user?.gameHistoryList ?? []).slice(0, 10).map((data) => {
  const displayData = (mockDashboardUserStats.gameHistoryList ?? [])
    .slice(0, 10)
    .map((data: DashboardMatch) => {
    return (
      <li
        key={data.gameId}
        className="grid grid-cols-5 gap-4 p-2 border border-transparent hover:border-violet-400 bg-violet-200 rounded-md m-1 items-center text-sm"
      >
        <p className="truncate ">{data.opponentName}</p>
        <p className="text-center ">{data.playerResult}</p>
        <p className="text-center ">{data.gameMode}</p>
        <p className="text-center ">{data.playerColor}</p>
        <p className="text-sm text-center">
          {formatGameDuration(data.gameDuration)}
        </p>
      </li>
    );
  });

  return (
    <section className="grid-style col-span-2">
      <h3>Historique des dix derniers matches</h3>
      <div className="border rounded-md m-2 p-1 bg-violet-100">
        <div className="grid grid-cols-5 gap-4 border-b-2 border-black m-1 p-2 font-semibold text-sm">
          <p>Adversaire</p>
          {/* <p className="text-center">Date</p> */}
          <p className="text-center">Résultat</p>
          <p className="text-center">Mode de jeu</p>
          <p className="text-center">Couleur joué</p>
          <p className="text-center">Temps de jeu</p>
        </div>
        <ul className="max-h-40 overflow-scroll">{displayData}</ul>
      </div>
    </section>
  );
}
