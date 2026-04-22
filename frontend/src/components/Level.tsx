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

interface LevelProps {
  level: number;
}

export default function Level({ level }: LevelProps) {
  const levelTitleData = [
    {
      id: 1,
      title: "Pion",
      img: faChessPawn,
      reach: 10,
      color: "text-yellow-800",
    },
    {
      id: 2,
      title: "Cavalier",
      img: faChessKnight,
      reach: 20,
      color: "text-zinc-400",
    },
    {
      id: 3,
      title: "Fou",
      img: faChessBishop,
      reach: 30,
      color: "text-yellow-500",
    },
    {
      id: 4,
      title: "Tour",
      img: faChessRook,
      reach: 50,
      color: "text-emerald-500",
    },
    {
      id: 5,
      title: "Roi",
      img: faChessKing,
      reach: 100,
      color: "text-rose-400",
    },
  ];

  const currentLevel = level;
  const nextLevelIndex = levelTitleData.findIndex((lvl) => currentLevel < lvl.reach);
  const isMaxRank = nextLevelIndex === -1;

  const currentRankIndex = isMaxRank ? levelTitleData.length - 1 : nextLevelIndex - 1;
  const currentRank = currentRankIndex >= 0 ? levelTitleData[currentRankIndex] : undefined;
  const nextLevel = isMaxRank ? undefined : levelTitleData[nextLevelIndex];

  const lastIndex = levelTitleData.length - 1;
  const progressStart = isMaxRank ? (levelTitleData[lastIndex - 1]?.reach ?? 0) : (currentRank?.reach ?? 0);
  const progressEnd = isMaxRank ? levelTitleData[lastIndex].reach : (nextLevel?.reach ?? levelTitleData[lastIndex].reach);
  const progressMax = Math.max(progressEnd - progressStart, 1);
  const progressValue = Math.min(Math.max(currentLevel - progressStart, 0), progressMax);

  const findLevelImg = (): IconDefinition => {
    return currentRank?.img ?? fa0;
  };

  const findLevelImgToReach = (): IconDefinition => {
    return nextLevel?.img ?? levelTitleData[levelTitleData.length - 1].img;
  };

  return (
    <div className="relative flex items-baseline gap-2 group">
      {nextLevel === undefined ? (
        <span></span>
      ) : (
        <FontAwesomeIcon
          icon={findLevelImg()}
          className={`${currentRank?.color}`}
        />
      )}

      <div className="h-3 w-40 rounded-lg overflow-hidden border border-violet-400">
        <progress
          value={progressValue}
          max={progressMax}
          className="level-style block w-full h-full"
        />
      </div>

      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-violet-500 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {currentLevel} / {progressEnd}
      </span>

      <FontAwesomeIcon
        icon={findLevelImgToReach()}
        className={isMaxRank ? `${currentRank?.color}` : "text-gray-300"}
      />
    </div>
  );
}
