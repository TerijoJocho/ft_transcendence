import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessPawn,
  faChessKnight,
  faChessBishop,
  faChessRook,
  faChessKing,
  fa0,
} from "@fortawesome/free-solid-svg-icons";

export default function Level() {
  const levelTitleMock = [
    {
      id: 1,
      title: "Pion",
      img: faChessPawn,
      reach: 10,
      color: 'text-yellow-800',
    },
    {
      id: 2,
      title: "Cavalier",
      img: faChessKnight,
      reach: 20,
      color: 'text-zinc-400',
    },
    {
      id: 3,
      title: "Fou",
      img: faChessBishop,
      reach: 30,
      color: 'text-yellow-500',
    },
    {
      id: 4,
      title: "Tour",
      img: faChessRook,
      reach: 50,
      color: 'text-emerald-500',
    },
    {
      id: 5,
      title: "Roi",
      img: faChessKing,
      reach: 100,
      color: 'text-rose-400',
    },
  ];

  // const {user} = useAuth();
  const user = { level: 99 }; // MOCK DATA
  const currentLevel = user.level;
  const nextLevelIndex = levelTitleMock.findIndex((lvl) => currentLevel < lvl.reach);
  const isMaxRank = nextLevelIndex === -1;

  const currentRankIndex = isMaxRank ? levelTitleMock.length - 1 : nextLevelIndex - 1;
  const currentRank = currentRankIndex >= 0 ? levelTitleMock[currentRankIndex] : undefined;
  const nextLevel = isMaxRank ? undefined : levelTitleMock[nextLevelIndex];

  const lastIndex = levelTitleMock.length - 1;
  const progressStart = isMaxRank ? (levelTitleMock[lastIndex - 1]?.reach ?? 0) : (currentRank?.reach ?? 0);
  const progressEnd = isMaxRank ? (levelTitleMock[lastIndex].reach) : (nextLevel?.reach ?? levelTitleMock[lastIndex].reach); 
  const progressMax = Math.max(progressEnd - progressStart, 1);
  const progressValue = Math.min(Math.max(currentLevel - progressStart, 0), progressMax);

  const findLevelImg = (): IconDefinition => {
    return currentRank?.img ?? fa0;
  };

  const findLevelImgToReach = (): IconDefinition => {
    return nextLevel?.img ?? levelTitleMock[levelTitleMock.length - 1].img;
  };

  console.log(nextLevel);

  return (
    <div className="relative flex items-baseline gap-2 group">
        {
            nextLevel === undefined
            ? <span></span>
            : <FontAwesomeIcon icon={findLevelImg()} className={`${currentRank?.color}`}/>
        }

        <div className="h-3 w-40 rounded-lg overflow-hidden border border-violet-400">
            <progress value={progressValue} max={progressMax} className="level-style block w-full h-full" />
        </div>

        <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-violet-500 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {currentLevel} / {progressEnd}
        </span>

        <FontAwesomeIcon icon={findLevelImgToReach()} className={isMaxRank ? `${currentRank?.color}` : "text-gray-300"} />
    </div>
  );
}
