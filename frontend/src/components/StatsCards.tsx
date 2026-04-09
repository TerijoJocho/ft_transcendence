export default function StatsCards({user}) {
    return (
        <section className="grid-style col-span-4 flex flex-row justify-between">
            <article className="stat-style">
                <h3>Latest WinRate</h3>
                <p className="">{user?.winrate}%</p>
            </article>
            <article className="stat-style">
                <h3>Win Streak</h3>
                <p>{user?.currentWinStreak}</p>
            </article>
            <article className="stat-style">
                <h3>Best Streak</h3>
                <p>{user?.longestWinStreak}</p>
            </article>
            <article className="stat-style">
                <h3>Total win</h3>
                <p>{user?.winCount}</p>
            </article>
            <article className="stat-style">
                <h3>Total Draw</h3>
                <p>{user?.drawCount}</p>
            </article>
            <article className="stat-style">
                <h3>Total losses</h3>
                <p>{user?.lossCount}</p>
            </article>
            <article className="stat-style">
                <h3>Total matches</h3>
                <p>{user?.totalGames}</p>
            </article>
            <article className="stat-style">
                <h3>Couleur favorite</h3>
                <p>{user?.favColor}</p>
            </article>
        </section>
    );
}