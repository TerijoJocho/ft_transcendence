import { mockDashboardUserStats } from "../data/mock_data";
import USE_MOCK_DATA from "../config/dataConfig";

export default function StatsCards({ userStats }) {
  const stats = USE_MOCK_DATA && !userStats ? mockDashboardUserStats : userStats;
  return (
    <section className="grid-style col-span-1 md:col-span-2 lg:col-span-4 flex flex-row flex-wrap justify-between gap-2">
      <article className="stat-style flex-1 min-w-[120px]">
        <h3>Dernier taux de victoire</h3>
        <p className="">{Number.parseFloat(stats?.winrate).toFixed(2) ?? 0}</p>
      </article>
      <article className="stat-style flex-1 min-w-[120px]">
        <h3>Série de victoires</h3>
        <p>{stats?.currentWinStreak ?? 0}</p>
      </article>
      <article className="stat-style flex-1 min-w-[120px]">
        <h3>Meilleure serie de victoires</h3>
        <p>{stats?.longestWinStreak ?? 0}</p>
      </article>
      <article className="stat-style flex-1 min-w-[120px]">
        <h3>Total des victoires</h3>
        <p>{stats?.winCount ?? 0}</p>
      </article>
      <article className="stat-style flex-1 min-w-[120px]">
        <h3>Total des match nuls</h3>
        <p>{stats?.drawCount ?? 0}</p>
      </article>
      <article className="stat-style flex-1 min-w-[120px]">
        <h3>Total des défaites</h3>
        <p>{stats?.lossCount ?? 0}</p>
      </article>
      <article className="stat-style flex-1 min-w-[120px]">
        <h3>Total des matches</h3>
        <p>{stats?.totalGames ?? 0}</p>
      </article>
      <article className="stat-style flex-1 min-w-[120px]">
        <h3>Couleur favorite</h3>
        <p>{stats?.favColor ?? "N/A"}</p>
      </article>
    </section>
  );
}
