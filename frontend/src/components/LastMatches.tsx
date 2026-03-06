import formatDate from "../utils/date";

export default function LastMatches() {
    //test
    const testArr = [
        {
            id: 1,
            opponent: "Charles",
            time: "12min",
            coups: "67",
            date: "2026-02-20",
            result: "win",
        },
        {
            id: 2,
            opponent: "Jean",
            time: "1min",
            coups: "3",
            date: "2026-02-21",
            result: "win",
        },
        {
            id: 3,
            opponent: "Patoche",
            time: "40min",
            coups: "138",
            date: "2026-02-22",
            result: "win",
        },
        {
            id: 4,
            opponent: "Joachim",
            time: "54min",
            coups: "232",
            date: "2026-02-23",
            result: "win",
        },
        {
            id: 5,
            opponent: "Daryl",
            time: "23min",
            coups: "32",
            date: "2026-02-24",
            result: "win",
        },
        {
            id: 6,
            opponent: "Daryl",
            time: "23min",
            coups: "32",
            date: "2026-02-24",
            result: "win",
        },
        {
            id: 7,
            opponent: "Daryl",
            time: "23min",
            coups: "32",
            date: "2026-02-24",
            result: "win",
        },
        {
            id: 8,
            opponent: "Daryl",
            time: "23min",
            coups: "32",
            date: "2026-02-24",
            result: "win",
        },
    ];

    // fetch all user match history (last matches)
    // display match history items
    const displayData = testArr.map((data) => {
        return (
            <li key={data.id} className="grid grid-cols-5 gap-4 p-2 border border-transparent hover:border-violet-400 bg-violet-200 rounded-md m-1 items-center">
                <p className="truncate ">{data.opponent}</p>
                <p className="text-sm text-center whitespace-nowrap overflow-scroll">{formatDate(data.date)}</p>
                <p className="text-center ">{data.result}</p>
                <p className="text-center ">{data.coups}</p>
                <p className="text-center ">{data.time}</p>
            </li>
        );
    });

    return(
        <section className="grid-style col-span-2">
            <h3>Historique des derniers matches</h3>
            <div className="border rounded-md m-2 p-1 bg-violet-100">
                <div className="grid grid-cols-5 gap-4 border-b-2 border-black m-1 p-2 font-semibold">
                    <p>Adversaire</p>
                    <p className="text-center">Date</p>
                    <p className="text-center">Résultat</p>
                    <p className="text-center">Nb. coups</p>
                    <p className="text-center">Temps</p>
                </div>
                <ul className="max-h-40 overflow-scroll">
                    {displayData}
                </ul>
            </div>
        </section>
    );
}