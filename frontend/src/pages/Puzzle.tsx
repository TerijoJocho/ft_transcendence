import { useState, useCallback } from "react";
import Header from "../components/Header.tsx";

type Cell = 0 | 1 | 2;
type Mode = "easy" | "hard" | null;

const WIN_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] | null } {
  for (const [a, b, c] of WIN_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every((c) => c !== 0)) return { winner: 0, line: null };
  return { winner: 0, line: null };
}

function isDraw(board: Cell[]): boolean {
  return (
    board.every((c) => c !== 0) &&
    !WIN_COMBOS.some(
      ([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c],
    )
  );
}

function findWinningMove(board: Cell[], player: Cell): number {
  for (const [a, b, c] of WIN_COMBOS) {
    const line = [a, b, c];
    const mine = line.filter((i) => board[i] === player).length;
    const empty = line.filter((i) => board[i] === 0);
    if (mine === 2 && empty.length === 1) return empty[0];
  }
  return -1;
}

function findWinningMoveFor(bd: Cell[], player: Cell): number {
  const combos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const c of combos) {
    const ones = c.filter((idx) => bd[idx] === player).length;
    const empties = c.filter((idx) => bd[idx] === 0);
    if (ones === 2 && empties.length === 1) return empties[0];
  }
  return 42;
}

function weirdForkThing(bd: Cell[]): number {
  if (bd[0] === 2) return bd[5] === 2 ? 6 : 2;
  if (bd[2] === 2) return bd[3] === 2 ? 8 : 0;
  if (bd[6] === 2) return bd[5] === 2 ? 0 : 8;
  if (bd[8] === 2) return bd[1] === 2 ? 6 : 2;
  return 42;
}

function defensiveMove(bd: Cell[]): number {
  if (bd[0] === 2 && bd[2] === 2) return 1;
  if (bd[0] === 2 && bd[6] === 2) return 3;
  if (bd[8] === 2 && bd[2] === 2) return 5;
  return 7;
}

function lazyFill(bd: Cell[]): number {
  const edges = [
    [0, 1, 2],
    [0, 3, 6],
    [2, 5, 8],
    [6, 7, 8],
  ];
  for (const line of edges) {
    if (!line.some((i) => bd[i] === 2)) {
      const emptySpot = line.find((i) => bd[i] === 0);
      if (emptySpot !== undefined) return emptySpot;
    }
  }
  return 42;
}

function firstEmpty(bd: Cell[]): number {
  for (let i = 0; i < bd.length; i++) {
    if (bd[i] === 0) return i;
  }
  return 8;
}

function hardBotMove(bd: Cell[], moves: number, last: number): number {
  const newBd = [...bd] as Cell[];
  if (moves === 1) {
    if ([1, 5, 6].includes(last)) newBd[2] = 1;
    else if ([2, 3, 7].includes(last)) newBd[6] = 1;
    else if (last === 0) newBd[8] = 1;
    else if (last === 8) newBd[0] = 1;
  } else if (moves === 2) {
    const winTry = findWinningMoveFor(newBd, 1);
    if (winTry === 42) {
      const edgeTaken = [1, 3, 5, 7].some((i) => newBd[i] === 2);
      const moveChoice = edgeTaken
        ? weirdForkThing(newBd)
        : defensiveMove(newBd);
      newBd[moveChoice] = 1;
    } else {
      newBd[winTry] = 1;
    }
  } else if (moves === 3) {
    const winTry = findWinningMoveFor(newBd, 1);
    if (winTry === 42) {
      const filler = lazyFill(newBd);
      newBd[filler === 42 ? firstEmpty(newBd) : filler] = 1;
    } else {
      newBd[winTry] = 1;
    }
  } else if (moves === 4) {
    const winTry = findWinningMoveFor(newBd, 1);
    newBd[winTry === 42 ? firstEmpty(newBd) : winTry] = 1;
  }
  return newBd.findIndex((c, i) => c === 1 && bd[i] === 0);
}

function easyBotMove(board: Cell[], moveCount: number): number {
  if (moveCount > 1) {
    const win = findWinningMove(board, 1);
    if (win !== -1) return win;
  }
  const empty = board.map((c, i) => (c === 0 ? i : -1)).filter((i) => i !== -1);
  return empty[Math.floor(Math.random() * empty.length)];
}

function ModeModal({ onSelect }: { onSelect: (mode: Mode) => void }) {

  return (

    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4">

        <p className="text-gray-900 dark:text-zinc-100 text-center text-base font-medium">

          Choisir la difficulté

        </p>

        <div className="flex gap-4 w-full">

          <button

            onClick={() => onSelect("easy")}

            className="flex-1 py-3 text-sm uppercase tracking-widest border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 rounded-md hover:bg-gray-300/30 dark:hover:bg-zinc-700/20 hover:border-gray-400 dark:hover:border-zinc-500 transition-all"

          >

            Facile

          </button>

          <button

            onClick={() => onSelect("hard")}

            className="flex-1 py-3 text-sm uppercase tracking-widest border border-violet-700 dark:border-yellow-700 text-violet-500 dark:text-yellow-400 rounded-md hover:bg-violet-700/20 dark:hover:bg-yellow-700/20 hover:border-violet-500 dark:hover:border-yellow-500 transition-all"

          >

            Difficile

          </button>

        </div>

      </div>

    </div>

  );

}

function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(0));
  const [mode, setMode] = useState<Mode>(null);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("");
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ player: 0, bot: 0, draws: 0 });
  const [showModal, setShowModal] = useState(true);
  const [moveCount, setMoveCount] = useState(0);
  // const [lastPlayerMove, setLastPlayerMove] = useState(-1);
  const [botThinking, setBotThinking] = useState(false);

  const initBoard = useCallback((selectedMode: Mode) => {
    const fresh: Cell[] = Array(9).fill(0);
    if (selectedMode === "hard") {
      fresh[4] = 1;
      setStatus("Le bot commence au centre.");
      setMoveCount(0);
      // setLastPlayerMove(-1);
    } else {
      setStatus("À vous de jouer.");
      setMoveCount(0);
      // setLastPlayerMove(-1);
    }
    setBoard(fresh);
    setGameOver(false);
    setWinLine(null);
    setBotThinking(false);
  }, []);

  function selectMode(selectedMode: Mode) {
    if (selectedMode !== mode) {
      setScores({ player: 0, bot: 0, draws: 0 });
    }
    setMode(selectedMode);
    setShowModal(false);
    initBoard(selectedMode);
  }

  function handleCellClick(idx: number) {
    if (gameOver || botThinking || board[idx] !== 0) return;

    const newBoard = [...board] as Cell[];
    newBoard[idx] = 2;
    const newMoveCount = moveCount + 1;
    setBoard(newBoard);
    // setLastPlayerMove(idx);
    setMoveCount(newMoveCount);

    const { winner, line } = checkWinner(newBoard);
    if (winner === 2) {
      setStatus("Vous gagnez !");
      setWinLine(line);
      setGameOver(true);
      setScores((s) => ({ ...s, player: s.player + 1 }));
      return;
    }
    if (isDraw(newBoard)) {
      setStatus("Match nul.");
      setGameOver(true);
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
      return;
    }

    setBotThinking(true);
    setStatus("Le bot réfléchit...");

    setTimeout(() => {
      const botBoard = [...newBoard] as Cell[];
      const botIdx =
        mode === "hard"
          ? hardBotMove(botBoard, newMoveCount, idx)
          : easyBotMove(botBoard, newMoveCount);

      if (botIdx !== -1 && botIdx !== undefined) {
        botBoard[botIdx] = 1;
      }
      setBoard(botBoard);

      const { winner: bw, line: bl } = checkWinner(botBoard);
      if (bw === 1) {
        setStatus("Le bot gagne.");
        setWinLine(bl);
        setGameOver(true);
        setScores((s) => ({ ...s, bot: s.bot + 1 }));
      } else if (isDraw(botBoard)) {
        setStatus("Match nul.");
        setGameOver(true);
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        setStatus("À vous de jouer.");
      }
      setBotThinking(false);
    }, 300);
  }

  return (
  <div className="text-gray-900 dark:text-zinc-100 w-full bg-gray-50 dark:bg-zinc-800 transition-colors duration-300">
    <div className="flex gap-6 p-6 justify-center items-start flex-wrap">
      {/* SCORE PANEL */}
      <div
        className="w-52 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg p-4 flex flex-col"
        style={{ height: "320px" }}
      >
        <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-3 pb-2 border-b border-gray-300 dark:border-zinc-700 flex-shrink-0">
          Scores
        </p>

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
              Vous
            </span>
            <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              {scores.player}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
              Bot
            </span>
            <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              {scores.bot}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
              Nuls
            </span>
            <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              {scores.draws}
            </span>
          </div>

          {mode && (
            <div className="mt-4 pt-3 border-t border-gray-300 dark:border-zinc-700">
              <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                Mode
              </span>

              <p
                className={`text-sm font-semibold mt-1 ${
                  mode === "hard"
                    ? "text-violet-500 dark:text-yellow-400"
                    : "text-gray-700 dark:text-zinc-300"
                }`}
              >
                {mode === "hard" ? "Difficile" : "Facile"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BOARD */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={`text-xs uppercase tracking-widest h-5 text-center transition-colors ${
            gameOver && status.includes("gagnez")
              ? "text-violet-500 dark:text-yellow-400 font-semibold"
              : gameOver && status.includes("gagne")
              ? "text-violet-500 dark:text-yellow-400 font-semibold"
              : gameOver
              ? "text-gray-600 dark:text-zinc-300 font-semibold"
              : botThinking
              ? "text-gray-500 dark:text-zinc-400"
              : "text-gray-500 dark:text-zinc-400"
          }`}
        >
          {status}
        </div>

        <div className="p-2.5 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-2xl">
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: "repeat(3, 120px)",
              gridTemplateRows: "repeat(3, 120px)",
            }}
          >
            {board.map((cell, idx) => {
              const isWin = winLine?.includes(idx);
              const light = (Math.floor(idx / 3) + (idx % 3)) % 2 === 0;

              let bgClass = light
                ? "bg-gray-300 dark:bg-zinc-600"
                : "bg-gray-500 dark:bg-zinc-700";

              if (isWin) {
                bgClass = light
                  ? "bg-violet-300 dark:bg-yellow-500"
                  : "bg-violet-500 dark:bg-yellow-600";
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className={`w-[120px] h-[120px] flex items-center justify-center select-none relative rounded-sm transition-all
                    ${bgClass}
                    ${
                      cell === 0 && !gameOver && !botThinking
                        ? "cursor-pointer hover:brightness-110"
                        : "cursor-default"
                    }
                  `}
                >
                  {cell === 2 && (
                    <span
                      className="text-violet-600 dark:text-yellow-400 font-bold"
                      style={{
                        fontSize: "52px",
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </span>
                  )}

                  {cell === 1 && (
                    <span
                      className="text-gray-900 dark:text-zinc-100 font-bold"
                      style={{
                        fontSize: "52px",
                        lineHeight: 1,
                      }}
                    >
                      ○
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 mt-1">
          <button
            onClick={() => initBoard(mode)}
            className="px-8 py-3 text-sm uppercase tracking-widest border border-violet-700 dark:border-yellow-700 text-violet-500 dark:text-yellow-400 rounded-md hover:bg-violet-700/20 dark:hover:bg-yellow-700/20 hover:border-violet-500 dark:hover:border-yellow-500 transition-all duration-200"
          >
            Restart
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 text-sm uppercase tracking-widest border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-md hover:bg-gray-300/20 dark:hover:bg-zinc-700/20 transition-all duration-200"
          >
            Mode
          </button>
        </div>

        {/* LEGEND */}
        <div className="flex gap-6 text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400 mt-1">
          <span className="flex items-center gap-2">
            <span className="text-violet-600 dark:text-yellow-400 text-base">
              ✕
            </span>
            Vous
          </span>

          <span className="flex items-center gap-2">
            <span className="text-gray-900 dark:text-zinc-100 text-base">
              ○
            </span>
            Bot
          </span>
        </div>
      </div>
    </div>

    {showModal && <ModeModal onSelect={selectMode} />}
  </div>
);
}

export function Puzzle() {
  return (
    <>
      <div className="rounded-md border border-gray-200 dark:border-zinc-700 w-full bg-white dark:bg-zinc-800 transition-colors duration-300">
        <div className="text-black dark:text-zinc-100">
          <Header title="Puzzle" />
        </div>
        <TicTacToe />
      </div>
    </>
  );
}
