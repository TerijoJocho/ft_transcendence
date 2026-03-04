export default function Achievement() {
  //test
  const testArr = [
    {
      id: 1,
      achievement: "Play for the first time",
    },
    {
      id: 2,
      achievement: "Win 5 time in a row",
    },
    {
      id: 3,
      achievement: "Win a tournament",
    },
    {
      id: 4,
      achievement: "Give the dev some tips",
    },
    {
      id: 5,
      achievement: "Lose for the first time",
    },
    {
      id: 6,
      achievement: "Lose for the first time",
    },
    {
      id: 7,
      achievement: "Lose for the first time",
    },
    {
      id: 8,
      achievement: "Lose for the first time",
    },
    {
      id: 9,
      achievement: "Lose for the first time",
    },
  ];

  // TODO: replace testArr with fetched user achievements
  // display achievements list
  const displayData = testArr.map((data) => {
    return (
      <li
        key={data.id}
        className="grid grid-cols-3 gap-4 p-2 border border-transparent hover:border-violet-400 bg-violet-200 rounded-md m-1 items-center"
      >
        <p className="text-base whitespace-nowrap">{data.achievement}</p>
      </li>
    );
  });

  return (
    <section className="grid-style col-span-1 row-span-1">
      <h3>Réalisations</h3>
      <div className="border rounded-md m-2 p-1 bg-violet-100">
        <ul className="max-h-48 overflow-scroll">{displayData}</ul>
      </div>
    </section>
  );
}
