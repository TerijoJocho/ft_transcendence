export default function StatsCards() {
    return (
        <section className="grid-style col-span-4 flex flex-row justify-between">
            <article className="stat-style">
                <h3>WinRate</h3>
                <p className="">35%</p>
            </article>
            <article className="stat-style">
                <h3>Win Streak</h3>
                <p>3</p>
            </article>
            <article className="stat-style">
                <h3>Best Streak</h3>
                <p>5</p>
            </article>
            <article className="stat-style">
                <h3>Total win</h3>
                <p>35</p>
            </article>
            <article className="stat-style">
                <h3>Total Draw</h3>
                <p>12</p>
            </article>
            <article className="stat-style">
                <h3>Total losses</h3>
                <p>65</p>
            </article>
            <article className="stat-style">
                <h3>Total matches</h3>
                <p>100</p>
            </article>
        </section>
    );
}