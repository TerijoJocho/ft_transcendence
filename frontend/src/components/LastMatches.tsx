import { mockDashboardUserStats } from "../data/mock_data";
import USE_MOCK_DATA from "../config/dataConfig";

function formatGameDuration(duration) {
  if (typeof duration !== "string") return "-";

  const durationParts = duration.split(":");
  if (durationParts.length !== 3) return duration;

  const [hoursStr, minutesStr, secondStr] = durationParts;
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const seconds = Number(secondStr.split(".")[0]);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return duration;
  }

  if (hours > 0) {
    return `${hours}h${minutes}min${seconds}s`;
  }

  if (minutes > 0) return `${minutes}min${seconds}s`;

  return `${seconds}s`;
}

export default function LastMatches({ userStats }) {
  const gameHistory =
    USE_MOCK_DATA && !userStats
      ? mockDashboardUserStats.gameHistoryList
      : userStats?.gameHistoryList;
  const displayData = (gameHistory ?? []).slice(0, 10).map((data) => {
    return (
      <li
        key={data.gameId}
        className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 p-2 border border-transparent hover:border-violet-400 dark:hover:border-yellow-500 bg-violet-200 dark:bg-yellow-700/60 rounded-md m-1 items-center"
      >
        <p className="col-span-2 sm:col-span-1 truncate font-medium sm:font-normal">
          {data.opponentName}
        </p>

        <p className="flex items-center justify-between sm:block sm:text-center">
          <span className="sm:hidden text-xs text-gray-600 dark:text-zinc-400">
            Résultat
          </span>
          <span className="truncate">{data.playerResult}</span>
        </p>

        <p className="flex items-center justify-between sm:block sm:text-center">
          <span className="sm:hidden text-xs text-gray-600 dark:text-zinc-400">
            Mode
          </span>
          <span className="truncate">{data.gameMode}</span>
        </p>

        <p className="flex items-center justify-between sm:block sm:text-center">
          <span className="sm:hidden text-xs text-gray-600 dark:text-zinc-400">
            Couleur
          </span>
          <span className="truncate">{data.playerColor}</span>
        </p>

        <p className="flex items-center justify-between sm:block text-sm sm:text-center whitespace-nowrap">
          <span className="sm:hidden text-xs text-gray-600 dark:text-zinc-400">
            Temps
          </span>
          <span>{formatGameDuration(data.gameDuration ?? "N/A")}</span>
        </p>
      </li>
    );
  });

  return (
    <section className="grid-style col-span-2">
      <h3>Historique des dix derniers matches</h3>
      <div className="border rounded-md m-2 p-1 bg-violet-100 dark:bg-yellow-900/60 dark:border-zinc-700">
        <div className="hidden sm:grid sm:grid-cols-5 gap-2 md:gap-4 border-b-2 border-black dark:border-zinc-600 m-1 p-2 font-semibold text-xs md:text-sm">
          <p className="min-w-0 truncate">Adversaire</p>
          <p className="min-w-0 truncate text-center">Résultat</p>
          <p className="min-w-0 truncate text-center">Mode de jeu</p>
          <p className="min-w-0 truncate text-center">Couleur jouée</p>
          <p className="min-w-0 truncate text-center">Temps de jeu</p>
        </div>
        <ul className="max-h-56 overflow-y-auto">
          {displayData.length === 0 ? "Aucune données" : displayData}
        </ul>
      </div>
    </section>
  );
}
