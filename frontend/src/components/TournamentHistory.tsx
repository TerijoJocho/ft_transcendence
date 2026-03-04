import formatDate from "../utils/date.ts";

export default function TournamentHistory() {
  //test
  const testArr = [
    {
      id: 1,
      tournamentTitle: "La joie de perdre",
      date: "2026-02-20",
      result: "win",
    },
    {
      id: 2,
      tournamentTitle: "La joie de perdre v2",
      date: "2026-02-20",
      result: "win",
    },
    {
      id: 3,
      tournamentTitle: "La joie de perdre",
      date: "2026-02-20",
      result: "win",
    },
    {
      id: 4,
      tournamentTitle: "La joie de perdre",
      date: "2026-02-20",
      result: "win",
    },
    {
      id: 5,
      tournamentTitle: "La joie de perdre",
      date: "2026-02-20",
      result: "win",
    },
  ];

  //fetch all user tournament history
  //display historyArr
  const displayData = testArr.map((data) => {
    return (
      <li
        key={data.id}
        className="grid grid-cols-3 gap-4 p-2 border border-transparent hover:border-violet-400 bg-violet-200 rounded-md m-1 items-center"
      >
        <p className="text-base">{data.tournamentTitle}</p>
        <p className="text-sm text-center">{formatDate(data.date)}</p>
        <p className="text-center">{data.result}</p>
      </li>
    );
  });

  return (
    <section className="grid-style col-span-2">
      <h3>Historique des derniers tournois</h3>
      <div className="border rounded-md m-2 p-1 bg-violet-100">
        <div className="grid grid-cols-3 gap-4 border-b-2 border-black m-1 p-2 font-semibold">
          <p>Tournois</p>
          <p className="text-center">Date</p>
          <p className="text-center">Résultat</p>
        </div>
        <ul className="max-h-40 overflow-scroll">{displayData}</ul>
      </div>
    </section>
  );
}
