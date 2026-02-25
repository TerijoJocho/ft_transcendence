export default function LeaderBoard() {
  //test
  const testArr = [
        {
            id: 1,
            opponent: "Charles",
            rank: 1,
            elo: 2756,
        },
        {
            id: 2,
            opponent: "Jean",
            rank: 2,
            elo: 2756,
        },
        {
            id: 3,
            opponent: "Patoche",
            rank: 3,
            elo: 2756,
        },
        {
            id: 4,
            opponent: "Joachim",
            rank: 4,
            elo: 2756,
        },
        {
            id: 5,
            opponent: "Daryl",
            rank: 5,
            elo: 2756,
        },
        {
            id: 6,
            opponent: "Daryl",
            rank: 6,
            elo: 2756,
        },
        {
            id: 7,
            opponent: "Daryl",
            rank: 7,
            elo: 2756,
        },
        {
            id: 8,
            opponent: "Daryl",
            rank: 8,
            elo: 2756,
        },
        {
            id: 9,
            opponent: "Daryl",
            rank: 9,
            elo: 2756,
        },
        {
            id: 10,
            opponent: "Daryl",
            rank: 10,
            elo: 2756,
        },
    ];

  //fetch all user tournament history
  //display historyArr
  const displayData = testArr.map((data) => {
    return (
      <li
        key={data.id}
        className="grid grid-cols-3 gap-4 p-2 border border-transparent hover:border-violet-400 bg-violet-200 rounded-md m-1 items-center sticky"
      >
        <p>{data.opponent}</p>
        <p className="text-center">{data.rank}</p>
        <p className="text-center">{data.elo}</p>
      </li>
    );
  });

  return (
    <section className="grid-style col-span-2 row-span-1">
      <h3>LeaderBoard</h3>
      <div className="border rounded-md m-2 p-1 bg-violet-100">
        <div className="grid grid-cols-3 gap-4 border-b-2 border-black m-1 p-2 font-semibold">
                    <p>Joueur</p>
                    <p className="text-center">Rang</p>
                    <p className="text-center">ELO</p>
                </div>
        <ul className="max-h-36 overflow-scroll">{displayData}</ul>
      </div>
    </section>
  );
}
