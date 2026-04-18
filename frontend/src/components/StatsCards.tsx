import { mockDashboardUserStats } from "../data/mock_data";

export default function StatsCards({ user: _user }) {
  // const stats = user;
  console.log(_user);
  const stats = mockDashboardUserStats;
  return (
    <section className="grid-style col-span-4 flex flex-row justify-between">
      <article className="stat-style">
        <h3>Latest WinRate</h3>
        <p className="">{stats?.winrate}</p>
      </article>
      <article className="stat-style">
        <h3>Win Streak</h3>
        <p>{stats?.currentWinStreak}</p>
      </article>
      <article className="stat-style">
        <h3>Best Streak</h3>
        <p>{stats?.longestWinStreak}</p>
      </article>
      <article className="stat-style">
        <h3>Total win</h3>
        <p>{stats?.winCount}</p>
      </article>
      <article className="stat-style">
        <h3>Total Draw</h3>
        <p>{stats?.drawCount}</p>
      </article>
      <article className="stat-style">
        <h3>Total losses</h3>
        <p>{stats?.lossCount}</p>
      </article>
      <article className="stat-style">
        <h3>Total matches</h3>
        <p>{stats?.totalGames}</p>
      </article>
      <article className="stat-style">
        <h3>Couleur favorite</h3>
        <p>{stats?.favColor}</p>
      </article>
    </section>
  );
}
