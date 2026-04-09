import formatDate from "../utils/date";

export default function LastMatches({user}) {
    // display match history items
    const displayData = user?.gameHistoryList.map((data) => {
        return (
            <li key={data.gameId} className="grid grid-cols-5 gap-4 p-2 border border-transparent hover:border-violet-400 bg-violet-200 rounded-md m-1 items-center">
                <p className="truncate ">{data.opponentName}</p>
                <p className="text-center ">{data.playerResult}</p>
                <p className="text-center ">{data.gameMode}</p>
                <p className="text-center ">{data.playerColor}</p>
                <p className="text-sm text-center whitespace-nowrap overflow-scroll">{data.gameDuration}</p>
            </li>
        );
    });

    return(
        <section className="grid-style col-span-2">
            <h3>Historique des derniers matches</h3>
            <div className="border rounded-md m-2 p-1 bg-violet-100">
                <div className="grid grid-cols-6 gap-4 border-b-2 border-black m-1 p-2 font-semibold">
                    <p>Adversaire</p>
                    <p className="text-center">Date</p>
                    <p className="text-center">Résultat</p>
                    <p className="text-center">Mode de jeu</p>
                    <p className="text-center">Couleur joué</p>
                    <p className="text-center">Temps</p>
                </div>
                <ul className="max-h-40 overflow-scroll">
                    {displayData}
                </ul>
            </div>
        </section>
    );
}