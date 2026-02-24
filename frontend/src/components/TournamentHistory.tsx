export default function TournamentHistory() {
    //test
    const testArr = [
        {
            id: 1,
            tournamentTitle: "La joie de perdre",
            opponent: "Charles",
            time: "12min",
            coups: "67",
            date: "2026-02-20",
        },
        {
            id: 2,
            opponent: "Jean",
            time: "1min",
            coups: "3",
            date: "2026-02-21",
        },
        {
            id: 3,
            opponent: "Patoche",
            time: "40min",
            coups: "138",
            date: "2026-02-22",
        },
        {
            id: 4,
            opponent: "Joachim",
            time: "54min",
            coups: "232",
            date: "2026-02-23",
        },
        {
            id: 5,
            opponent: "Daryl",
            time: "23min",
            coups: "32",
            date: "2026-02-24",
        },
    ];
    //fetch all user tournament history
    //display historyArr
    const displayData = testArr.map((data) => {
        return (
            <li key={data.id}>
                    Partie contre {data.opponent}, le {data.date} en {data.coups} de coups pendant {data.time}.
            </li>
        );
    });
    return(
        <section className="grid-style">
            <h1>Tournois auxquels tu as participé</h1>
            <ul className="border rounded-md m-2 p-1">
                {displayData}
            </ul>
        </section>
    );
}