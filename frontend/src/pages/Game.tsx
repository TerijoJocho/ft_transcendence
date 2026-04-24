import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.ts";
import Header from "../components/Header.tsx";
import type { Socket } from "socket.io-client";
import {
  createGame,
  getGameSession,
  getPendingGames,
  joinGame,
  endGame,
  giveupGame,
  cancelGame,
  connectGameSocket,
} from "../api/api.ts";
import type { PendingGameResponse } from "../api/api.ts";

const PIECES = {
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  p: "♟",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
  P: "♙",
};

const INIT_BOARD = () => [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];
const INIT_MOVED = () => ({
  K: false,
  R0: false,
  R7: false,
  k: false,
  r0: false,
  r7: false,
});
type MovedState = ReturnType<typeof INIT_MOVED>;

function isCurrentPlayerPiece(p, player) {
  return player === "white" ? p === p.toUpperCase() : p === p.toLowerCase();
}
function isPathClear(b, sr, sc, dr, dc) {
  const rs = Math.sign(dr - sr),
    cs = Math.sign(dc - sc);
  let r = sr + rs,
    c = sc + cs;
  while (r !== dr || c !== dc) {
    if (b[r][c] !== "") return false;
    r += rs;
    c += cs;
  }
  return true;
}
function isValidPieceMove(b, sr, sc, dr, dc, ep) {
  const p = b[sr][sc],
    t = b[dr][dc],
    rd = dr - sr,
    cd = dc - sc;
  switch (p.toLowerCase()) {
    case "p": {
      const dir = p === "P" ? -1 : 1,
        start = p === "P" ? 6 : 1;
      if (cd === 0 && !t) {
        if (rd === dir) return true;
        if (sr === start && rd === 2 * dir && !b[sr + dir][sc]) return true;
      }
      if (Math.abs(cd) === 1 && rd === dir) {
        if (t) return true;
        if (ep && ep.row === dr && ep.col === dc) return true;
      }
      return false;
    }
    case "r":
      if (rd && cd) return false;
      return isPathClear(b, sr, sc, dr, dc);
    case "n":
      return (
        (Math.abs(rd) === 2 && Math.abs(cd) === 1) ||
        (Math.abs(rd) === 1 && Math.abs(cd) === 2)
      );
    case "b":
      if (Math.abs(rd) !== Math.abs(cd)) return false;
      return isPathClear(b, sr, sc, dr, dc);
    case "q":
      if (rd === 0 || cd === 0 || Math.abs(rd) === Math.abs(cd))
        return isPathClear(b, sr, sc, dr, dc);
      return false;
    case "k":
      if (Math.abs(rd) <= 1 && Math.abs(cd) <= 1) return true;
      return false;
    default:
      return false;
  }
}
function isInCheck(b, player, ep) {
  const k = player === "white" ? "K" : "k";
  let kr, kc;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c] === k) {
        kr = r;
        kc = c;
      }
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p) continue;
      if (
        (player === "white" ? p === p.toLowerCase() : p === p.toUpperCase()) &&
        isValidPieceMove(b, r, c, kr, kc, ep)
      )
        return true;
    }
  return false;
}
function isSquareAttacked(b, r, c, byWhite, ep) {
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      const p = b[i][j];
      if (!p) continue;
      if (
        (byWhite ? p === p.toUpperCase() : p === p.toLowerCase()) &&
        isValidPieceMove(b, i, j, r, c, ep)
      )
        return true;
    }
  return false;
}
function canCastle(b, r, _c, dc, moved, player, ep) {
  const w = player === "white";
  if ((w && moved.K) || (!w && moved.k)) return false;
  if (dc === 6) {
    if ((w && moved.R7) || (!w && moved.r7)) return false;
    if (b[r][5] || b[r][6]) return false;
    if (
      isSquareAttacked(b, r, 4, !w, ep) ||
      isSquareAttacked(b, r, 5, !w, ep) ||
      isSquareAttacked(b, r, 6, !w, ep)
    )
      return false;
    return true;
  }
  if (dc === 2) {
    if ((w && moved.R0) || (!w && moved.r0)) return false;
    if (b[r][1] || b[r][2] || b[r][3]) return false;
    if (
      isSquareAttacked(b, r, 4, !w, ep) ||
      isSquareAttacked(b, r, 3, !w, ep) ||
      isSquareAttacked(b, r, 2, !w, ep)
    )
      return false;
    return true;
  }
  return false;
}
function isLegalMove(b, sr, sc, dr, dc, player, moved, ep) {
  if (sr === dr && sc === dc) return false;
  const p = b[sr][sc],
    t = b[dr][dc];
  if (!p) return false;
  if (t && isCurrentPlayerPiece(t, player)) return false;
  if (p.toLowerCase() === "k" && Math.abs(dc - sc) === 2) {
    if (!canCastle(b, sr, sc, dc, moved, player, ep)) return false;
  } else if (!isValidPieceMove(b, sr, sc, dr, dc, ep)) return false;
  const nb = b.map((r) => r.slice());
  if (p.toLowerCase() === "p" && dc !== sc && !nb[dr][dc]) nb[sr][dc] = "";
  if (p.toLowerCase() === "k" && Math.abs(dc - sc) === 2) {
    if (dc === 6) {
      nb[sr][5] = nb[sr][7];
      nb[sr][7] = "";
    }
    if (dc === 2) {
      nb[sr][3] = nb[sr][0];
      nb[sr][0] = "";
    }
  }
  nb[dr][dc] = nb[sr][sc];
  nb[sr][sc] = "";
  return !isInCheck(nb, player, null);
}
function getLegalMoves(b, r, c, player, moved, ep) {
  const moves = [];
  for (let dr = 0; dr < 8; dr++)
    for (let dc = 0; dc < 8; dc++)
      if (isLegalMove(b, r, c, dr, dc, player, moved, ep))
        moves.push({ row: dr, col: dc, capture: b[dr][dc] !== "" });
  return moves;
}
function hasAnyLegalMoves(b, player, moved, ep) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p || !isCurrentPlayerPiece(p, player)) continue;
      if (getLegalMoves(b, r, c, player, moved, ep).length > 0) return true;
    }
  return false;
}
function toNotation(
  _sr,
  sc,
  dr,
  dc,
  piece,
  target,
  boardAfter,
  nextPlayer,
  ep,
) {
  const isPawn = piece.toLowerCase() === "p",
    isCapture = target !== "" || (isPawn && sc !== dc);
  let n = "";
  if (piece.toLowerCase() === "k" && Math.abs(dc - sc) === 2) {
    n = dc === 6 ? "O-O" : "O-O-O";
  } else {
    if (!isPawn) n += piece.toUpperCase();
    else if (isCapture) n += String.fromCharCode(97 + sc);
    if (isCapture) n += "x";
    n += String.fromCharCode(97 + dc) + (8 - dr);
  }
  const inChk = isInCheck(boardAfter, nextPlayer, ep);
  const hasL = inChk && hasAnyLegalMoves(boardAfter, nextPlayer, {}, ep);
  if (inChk) n += hasL ? "+" : "#";
  return n;
}
function applyMove(b, sr, sc, dr, dc, moved, _ep, halfmove) {
  const nb = b.map((r) => r.slice()),
    piece = nb[sr][sc],
    target = nb[dr][dc],
    pl = piece.toLowerCase();
  const newMoved = { ...moved };
  if (piece === "K") newMoved.K = true;
  if (piece === "k") newMoved.k = true;
  if (piece === "R" && sr === 7 && sc === 0) newMoved.R0 = true;
  if (piece === "R" && sr === 7 && sc === 7) newMoved.R7 = true;
  if (piece === "r" && sr === 0 && sc === 0) newMoved.r0 = true;
  if (piece === "r" && sr === 0 && sc === 7) newMoved.r7 = true;
  let newEp = null;
  if (pl === "p" && Math.abs(dr - sr) === 2)
    newEp = { row: (sr + dr) / 2, col: sc };
  if (pl === "p" && dc !== sc && nb[dr][dc] === "") nb[sr][dc] = "";
  if (pl === "k" && Math.abs(dc - sc) === 2) {
    if (dc === 6) {
      nb[sr][5] = nb[sr][7];
      nb[sr][7] = "";
    }
    if (dc === 2) {
      nb[sr][3] = nb[sr][0];
      nb[sr][0] = "";
    }
  }
  nb[dr][dc] = nb[sr][sc];
  nb[sr][sc] = "";
  return {
    nb,
    piece,
    target,
    newMoved,
    newEp,
    newHalfmove: pl === "p" || target !== "" ? 0 : halfmove + 1,
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Clock({
  seconds,
  active,
  low,
}: {
  seconds: number;
  active: boolean;
  low: boolean;
}) {
  return (
    <div
      className={`px-5 py-2 rounded-lg border font-mono text-2xl font-semibold tracking-widest transition-all duration-300
      ${low ? "border-violet-500 dark:border-yellow-500 text-violet-500 dark:text-yellow-400 bg-violet-500/10 dark:bg-yellow-500/10" : active ? "border-gray-400 dark:border-zinc-500 text-gray-900 dark:text-zinc-100 bg-gray-200 dark:bg-zinc-700" : "border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900"}`}
    >
      {formatTime(seconds)}
    </div>
  );
}

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4">
        <p className="text-gray-900 dark:text-zinc-100 text-center text-base font-medium">
          {message}
        </p>
        <div className="flex gap-4 w-full">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-sm uppercase tracking-widest border border-violet-700 dark:border-yellow-700 text-violet-500 dark:text-yellow-400 rounded-md hover:bg-violet-700/20 dark:hover:bg-yellow-700/20 hover:border-violet-500 dark:hover:border-yellow-500 transition-all"
          >
            Confirmer
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm uppercase tracking-widest border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 rounded-md hover:bg-gray-300/30 dark:hover:bg-zinc-700/20 hover:border-gray-400 dark:hover:border-zinc-500 transition-all"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

type OnlineConfig = {
  enabled: boolean;
  gameId: number | null;
  playerColor: "WHITE" | "BLACK" | null;
  gameStatus: "PENDING" | "ONGOING" | "COMPLETED" | null;
};

type PendingGame = {
  gameId: PendingGameResponse["gameId"];
  gameMode: PendingGameResponse["gameMode"];
  creatorName: PendingGameResponse["creatorName"];
  creatorId: PendingGameResponse["creatorId"];
  creatorColor: PendingGameResponse["creatorColor"];
  gameCreatedAt: PendingGameResponse["gameCreatedAt"];
};

type GameStateSnapshot = {
  gameId: number;
  board: string[][];
  turn: "white" | "black";
  moved: MovedState;
  ep: { row: number; col: number } | null;
  halfmove: number;
  history: string[];
  gameOver: boolean;
  status: string;
  lastMove: number[] | null;
  whiteTime: number | null;
  blackTime: number | null;
  clockStarted: boolean;
  gameResult: { winner: string; reason: string } | null;
};

function ChessGame({
  onBack,
  timeControl,
  online,
  activeGameStatus,
}: {
  onBack: () => void;
  timeControl: string;
  online: OnlineConfig;
  activeGameStatus: OnlineConfig["gameStatus"];
}) {
  const initSeconds =
    timeControl === "Bullet" ? 60 : timeControl === "Blitz" ? 300 : null;
  const hasClock = initSeconds !== null;
  const isOnline =
    online.enabled && online.gameId !== null && online.playerColor !== null;

  // Board flip for black player online
  const isFlipped = isOnline && online.playerColor === "BLACK";
  const displayRows = isFlipped
    ? [7, 6, 5, 4, 3, 2, 1, 0]
    : [0, 1, 2, 3, 4, 5, 6, 7];
  const displayCols = isFlipped
    ? [7, 6, 5, 4, 3, 2, 1, 0]
    : [0, 1, 2, 3, 4, 5, 6, 7];
  const rankLabels = isFlipped
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1];
  const fileLabels = isFlipped
    ? ["h", "g", "f", "e", "d", "c", "b", "a"]
    : ["a", "b", "c", "d", "e", "f", "g", "h"];

  const [board, setBoard] = useState(INIT_BOARD);
  const [player, setPlayer] = useState("white");
  const [selected, setSelected] = useState(null);
  const [moved, setMoved] = useState(INIT_MOVED);
  const [ep, setEp] = useState(null);
  const [halfmove, setHalfmove] = useState(0);
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("");
  const [pendingPromo, setPendingPromo] = useState(null);
  const [hints, setHints] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  const [whiteTime, setWhiteTime] = useState(initSeconds);
  const [blackTime, setBlackTime] = useState(initSeconds);
  const [clockStarted, setClockStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gameResult, setGameResult] = useState<{
    winner: string;
    reason: string;
  } | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<string | null>(
    online.gameStatus === "PENDING"
      ? "En attente d'un deuxième joueur..."
      : null,
  );
  const [resolvedGameStatus, setResolvedGameStatus] = useState<
    OnlineConfig["gameStatus"]
  >(activeGameStatus ?? online.gameStatus ?? null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isApplyingRemoteRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedGameStatus(activeGameStatus ?? online.gameStatus ?? null);
  }, [activeGameStatus, online.gameStatus]);

  useEffect(() => {
    if (!isOnline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOnlineStatus(null);
      return;
    }
    if (resolvedGameStatus === "PENDING") {
      setOnlineStatus("En attente d'un deuxième joueur...");
      return;
    }
    setOnlineStatus(null);
  }, [isOnline, resolvedGameStatus]);

  // Confirm modal: "restart" | "giveup" | "cancel" | null
  const [confirmAction, setConfirmAction] = useState<
    "restart" | "giveup" | "cancel" | null
  >(null);

  const [dragSource, setDragSource] = useState<[number, number] | null>(null);
  const [dragOver, setDragOver] = useState<[number, number] | null>(null);

  const historyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (historyRef.current)
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [history]);

  const persistEndOfGame = useCallback(
    async (result: { winner: string; reason: string }, moveCount: number) => {
      if (!isOnline || !online.gameId) return;
      const winnerNbMoves = Math.ceil(moveCount / 2);
      const isDraw = result.winner === "Draw";
      try {
        if (isDraw) {
          await endGame(online.gameId, {
            totalNbMoves: moveCount,
            winnerNbMoves,
            gameResult: "DRAW",
          });
        } else {
          const winnerColor = result.winner === "White" ? "WHITE" : "BLACK";
          await endGame(online.gameId, {
            totalNbMoves: moveCount,
            winnerNbMoves,
            gameResult: "WIN",
            winnerColor,
          });
        }
      } catch {
        /* best effort */
      }
    },
    [isOnline, online.gameId],
  );

  const exportSnapshot = useCallback(() => {
    if (!online.gameId) return null;
    return {
      gameId: online.gameId,
      board,
      turn: player,
      moved,
      ep,
      halfmove,
      history,
      gameOver,
      status,
      lastMove,
      whiteTime,
      blackTime,
      clockStarted,
      gameResult,
    };
  }, [
    online.gameId,
    board,
    player,
    moved,
    ep,
    halfmove,
    history,
    gameOver,
    status,
    lastMove,
    whiteTime,
    blackTime,
    clockStarted,
    gameResult,
  ]);

  const applySnapshot = useCallback(
    (snapshot: GameStateSnapshot | null) => {
      if (!snapshot) return;
      isApplyingRemoteRef.current = true;
      setBoard(snapshot.board);
      setPlayer(snapshot.turn);
      setMoved(snapshot.moved);
      setEp(snapshot.ep);
      setHalfmove(snapshot.halfmove);
      setHistory(snapshot.history ?? []);
      setGameOver(Boolean(snapshot.gameOver));
      setStatus(snapshot.status ?? "");
      setLastMove(snapshot.lastMove ?? null);
      setWhiteTime(snapshot.whiteTime ?? initSeconds);
      setBlackTime(snapshot.blackTime ?? initSeconds);
      setClockStarted(Boolean(snapshot.clockStarted));
      setGameResult(snapshot.gameResult ?? null);
      setPendingPromo(null);
      setSelected(null);
      setHints([]);
      queueMicrotask(() => {
        isApplyingRemoteRef.current = false;
      });
    },
    [initSeconds],
  );

  useEffect(() => {
    if (!isOnline || !online.gameId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }
    const socket = connectGameSocket();
    socketRef.current = socket;
    socket.on("connect", () => {
      setOnlineError(null);
      socket.emit("join_game", { gameId: online.gameId });
      socket.emit("sync_request", { gameId: online.gameId });
      void (async () => {
        try {
          const session = await getGameSession(online.gameId);
          setResolvedGameStatus(session.gameStatus);
        } catch {
          /* best effort */
        }
      })();
    });
    socket.on("sync_state", (snapshot) => {
      if (snapshot) {
        applySnapshot(snapshot);
        setResolvedGameStatus((current) =>
          current === "COMPLETED" ? current : "ONGOING",
        );
      }
    });
    socket.on("remote_move", (snapshot) => {
      applySnapshot(snapshot);
      setResolvedGameStatus((current) =>
        current === "COMPLETED" ? current : "ONGOING",
      );
    });
    socket.on("player_joined", () => {
      setResolvedGameStatus("ONGOING");
      setOnlineStatus("Deuxième joueur connecté. La partie commence.");
    });
    socket.on("opponent_disconnected", () => {
      // setOnlineError("L'adversaire s'est déconnecté.");
    });
    socket.on("game_error", (payload: { message?: string }) => {
      void payload;
      // setOnlineError(payload?.message ?? "Erreur temps réel.");
    });
    socket.on("game_over", (result) => {
      setResolvedGameStatus("COMPLETED");
      setOnlineStatus(null);
      setGameResult(result ?? { winner: "Draw", reason: "finished" });
      setGameOver(true);
      // setOnlineStatus("Partie terminée.");
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOnline, online.gameId, online.gameStatus, applySnapshot]);

  useEffect(() => {
    if (!hasClock || !clockStarted || gameOver) return;
    intervalRef.current = setInterval(() => {
      if (player === "white") {
        setWhiteTime((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            const r = { winner: "Black", reason: "timeout" };
            setGameOver(true);
            setStatus("Time's up — Black wins!");
            setGameResult(r);
            void persistEndOfGame(r, history.length);
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            const r = { winner: "White", reason: "timeout" };
            setGameOver(true);
            setStatus("Time's up — White wins!");
            setGameResult(r);
            void persistEndOfGame(r, history.length);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [
    player,
    clockStarted,
    gameOver,
    hasClock,
    history.length,
    persistEndOfGame,
  ]);

  // Auto-redirect 5 seconds after game ends
  useEffect(() => {
    if (gameOver) {
      redirectTimerRef.current = setTimeout(() => {
        onBack();
      }, 5000);
    }
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [gameOver, onBack]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current!);
    setBoard(INIT_BOARD());
    setPlayer("white");
    setSelected(null);
    setMoved(INIT_MOVED());
    setEp(null);
    setHalfmove(0);
    setHistory([]);
    setGameOver(false);
    setStatus("");
    setPendingPromo(null);
    setHints([]);
    setLastMove(null);
    setWhiteTime(initSeconds);
    setBlackTime(initSeconds);
    setClockStarted(false);
    setGameResult(null);
    setDragSource(null);
    setDragOver(null);
  }, [initSeconds]);

  const lastEmittedBoardRef = useRef<string>("");

  useEffect(() => {
    if (!isOnline) return;
    const socket = socketRef.current;
    const snapshot = exportSnapshot();
    if (!socket || !snapshot) return;
    const boardKey = JSON.stringify(board) + player;
    if (boardKey === lastEmittedBoardRef.current) return;
    lastEmittedBoardRef.current = boardKey;
    socket.emit("move", { gameId: snapshot.gameId, state: snapshot });
  }, [
    board,
    player,
    moved,
    ep,
    halfmove,
    history,
    gameOver,
    status,
    lastMove,
    whiteTime,
    blackTime,
    clockStarted,
    gameResult,
    isOnline,
    exportSnapshot,
    online.playerColor,
  ]);

  function evalState(b, next, m, newEp, hm) {
    if (hm >= 100) {
      const r = { winner: "Draw", reason: "50-move rule" };
      setStatus("Draw — 50-move rule");
      setGameOver(true);
      setGameResult(r);
      void persistEndOfGame(r, hm);
      return;
    }
    const inChk = isInCheck(b, next, newEp),
      hasL = hasAnyLegalMoves(b, next, m, newEp);
    if (inChk && !hasL) {
      const winner = next === "white" ? "Black" : "White";
      const r = { winner, reason: "checkmate" };
      setStatus(`Checkmate — ${winner} wins!`);
      setGameOver(true);
      setGameResult(r);
      void persistEndOfGame(r, hm);
    } else if (!inChk && !hasL) {
      const r = { winner: "Draw", reason: "stalemate" };
      setStatus("Stalemate — Draw");
      setGameOver(true);
      setGameResult(r);
      void persistEndOfGame(r, hm);
    } else if (inChk)
      setStatus(`${next === "white" ? "White" : "Black"} is in check!`);
    else setStatus("");
  }

  function executeMove(
    sr: number,
    sc: number,
    dr: number,
    dc: number,
  ): boolean {
    if (isOnline && resolvedGameStatus !== "ONGOING") return false;
    if (!isLegalMove(board, sr, sc, dr, dc, player, moved, ep)) return false;
    if (hasClock && !clockStarted) setClockStarted(true);
    const {
      nb,
      piece: mp,
      target,
      newMoved,
      newEp,
      newHalfmove,
    } = applyMove(board, sr, sc, dr, dc, moved, ep, halfmove);
    setLastMove([sr, sc, dr, dc]);
    setSelected(null);
    setHints([]);
    if ((nb[dr][dc] === "P" && dr === 0) || (nb[dr][dc] === "p" && dr === 7)) {
      setBoard(nb);
      setMoved(newMoved);
      setEp(newEp);
      setHalfmove(newHalfmove);
      setPendingPromo({
        row: dr,
        col: dc,
        isWhite: nb[dr][dc] === "P",
        sr,
        sc,
        mp,
        target,
        nb,
        newMoved,
        newEp,
        newHalfmove,
      });
      return true;
    }
    const next = player === "white" ? "black" : "white";
    setHistory((h) => [
      ...h,
      toNotation(sr, sc, dr, dc, mp, target, nb, next, newEp),
    ]);
    setBoard(nb);
    setMoved(newMoved);
    setEp(newEp);
    setHalfmove(newHalfmove);
    setPlayer(next);
    evalState(nb, next, newMoved, newEp, newHalfmove);
    return true;
  }

  function handleClick(r, c) {
    if (gameOver || pendingPromo) return;
    if (isOnline && resolvedGameStatus !== "ONGOING") return;
    if (isOnline) {
      const expectedTurn = online.playerColor === "WHITE" ? "white" : "black";
      if (player !== expectedTurn) return;
    }
    const piece = board[r][c];
    if (selected) {
      const [sr, sc] = selected;
      if (!executeMove(sr, sc, r, c)) {
        if (piece && isCurrentPlayerPiece(piece, player)) {
          setSelected([r, c]);
          setHints(getLegalMoves(board, r, c, player, moved, ep));
        } else {
          setSelected(null);
          setHints([]);
        }
      }
    } else if (piece && isCurrentPlayerPiece(piece, player)) {
      setSelected([r, c]);
      setHints(getLegalMoves(board, r, c, player, moved, ep));
    }
  }

  function handleDragStart(e: React.DragEvent, r: number, c: number) {
    if (gameOver || pendingPromo) {
      e.preventDefault();
      return;
    }
    if (isOnline && resolvedGameStatus !== "ONGOING") {
      e.preventDefault();
      return;
    }
    if (isOnline) {
      const expectedTurn = online.playerColor === "WHITE" ? "white" : "black";
      if (player !== expectedTurn) {
        e.preventDefault();
        return;
      }
    }
    const piece = board[r][c];
    if (!piece || !isCurrentPlayerPiece(piece, player)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    setDragSource([r, c]);
    setSelected([r, c]);
    setHints(getLegalMoves(board, r, c, player, moved, ep));
  }

  function handleDragOver(e: React.DragEvent, r: number, c: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver([r, c]);
  }

  function handleDragEnd() {
    setDragSource(null);
    setDragOver(null);
  }

  function handleDrop(e: React.DragEvent, dr: number, dc: number) {
    e.preventDefault();
    setDragOver(null);
    if (!dragSource) return;
    const [sr, sc] = dragSource;
    setDragSource(null);
    if (sr === dr && sc === dc) {
      setSelected(null);
      setHints([]);
      return;
    }
    executeMove(sr, sc, dr, dc);
  }

  function selectPromo(p) {
    if (!pendingPromo) return;
    const { row, col, sr, sc, mp, target, nb, newMoved, newEp, newHalfmove } =
      pendingPromo;
    const fb = nb.map((r) => r.slice());
    fb[row][col] = p;
    const next = player === "white" ? "black" : "white";
    const n =
      toNotation(sr, sc, row, col, mp, target, fb, next, newEp) +
      "=" +
      p.toUpperCase();
    setHistory((h) => [...h, n]);
    setBoard(fb);
    setMoved(newMoved);
    setEp(newEp);
    setHalfmove(newHalfmove);
    setPlayer(next);
    setPendingPromo(null);
    evalState(fb, next, newMoved, newEp, newHalfmove);
  }

  async function handleGiveUpConfirm() {
    setConfirmAction(null);
    const totalNbMoves = history.length;
    const winnerNbMoves =
      player === "white"
        ? Math.floor(totalNbMoves / 2)
        : Math.ceil(totalNbMoves / 2);
    if (isOnline && online.gameId && !gameOver) {
      try {
        await giveupGame(online.gameId, { totalNbMoves, winnerNbMoves });
        if (socketRef.current?.connected)
          socketRef.current.emit("giveup", { gameId: online.gameId });
      } catch (e) {
        console.log(e);
      }
    }
    onBack();
  }

  async function handleCancelConfirm() {
    setConfirmAction(null);
    if (isOnline && online.gameId && !gameOver) {
      try {
        await cancelGame(online.gameId);
        if (socketRef.current?.connected)
          socketRef.current.emit("cancel", { gameId: online.gameId });
      } catch {
        console.error("Erreur produite lors de l'abandon du jeu");
      }
    }
    onBack();
  }

  function handleQuit() {
    console.log(resolvedGameStatus);
    if (resolvedGameStatus === "PENDING") {
      setConfirmAction("cancel");
    } else if (resolvedGameStatus === "ONGOING") {
      setConfirmAction("giveup");
    } else {
      onBack();
    }
  }

  const hintSet = new Set(hints.map((h) => `${h.row},${h.col}`));
  const captureSet = new Set(
    hints.filter((h) => h.capture).map((h) => `${h.row},${h.col}`),
  );
  const lowThreshold = initSeconds ? Math.min(30, initSeconds * 0.2) : 30;

  // Clock labels/values based on board flip
  const topClockPlayer = isFlipped ? "white" : "black";
  const botClockPlayer = isFlipped ? "black" : "white";
  const topClockSeconds = isFlipped ? whiteTime! : blackTime!;
  const botClockSeconds = isFlipped ? blackTime! : whiteTime!;
  const topClockLabel = isFlipped ? "White" : "Black";
  const botClockLabel = isFlipped ? "Black" : "White";

  return (
    <div className="text-gray-900 dark:text-zinc-100 w-full bg-gray-50 dark:bg-zinc-800 transition-colors duration-300">
      {isOnline && online.gameId && (
        <div className="flex justify-end px-6 pt-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2">
            <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
              Game ID
            </span>
            <span className="font-mono text-violet-400 dark:text-yellow-600 font-semibold text-sm select-all">
              {online.gameId}
            </span>
          </div>
        </div>
      )}
      <div className="flex gap-6 p-4 sm:p-6 justify-center items-start flex-wrap">
        {/* Move history */}
        <div
          className="w-52 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg p-4 flex flex-col"
          style={{ height: "520px" }}
        >
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-2 pb-2 border-b border-gray-300 dark:border-zinc-700 flex-shrink-0">
            Moves
          </p>
          <div className="flex gap-2 text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-1 flex-shrink-0">
            <span className="w-6"></span>
            <span className="w-16">White</span>
            <span className="w-16">Black</span>
          </div>
          <div
            ref={historyRef}
            className="overflow-y-auto flex-1 flex flex-col gap-1 pr-1"
          >
            {Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-gray-600 dark:text-zinc-500 w-6 flex-shrink-0">
                  {i + 1}.
                </span>
                <span className="text-gray-700 dark:text-zinc-300 w-16">
                  {history[i * 2] ?? ""}
                </span>
                <span className="text-gray-500 dark:text-zinc-400 w-16">
                  {history[i * 2 + 1] ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {/* Top clock */}
          {hasClock && (
            <div className="flex items-center gap-3 self-end">
              <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                {topClockLabel}
              </span>
              <Clock
                seconds={topClockSeconds}
                active={player === topClockPlayer && clockStarted && !gameOver}
                low={topClockSeconds <= lowThreshold}
              />
            </div>
          )}
          {!hasClock && (
            <div className="flex items-center gap-4">
              <span
                className={`text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all duration-200 ${player === "black" && !gameOver ? "border-violet-500 dark:border-yellow-500 text-violet-500 dark:text-yellow-400 bg-violet-500/10 dark:bg-yellow-500/10" : "border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400"}`}
              >
                Black
              </span>
              <span className="text-xs text-gray-600 dark:text-zinc-400 tracking-widest">
                vs
              </span>
              <span
                className={`text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all duration-200 ${player === "white" && !gameOver ? "border-violet-500 dark:border-yellow-500 text-violet-500 dark:text-yellow-400 bg-violet-500/10 dark:bg-yellow-500/10" : "border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400"}`}
              >
                White
              </span>
            </div>
          )}

          {/* Status bar */}
          <div
            className={`text-xs uppercase tracking-widest h-5 text-center transition-colors ${gameOver ? "text-violet-500 dark:text-yellow-400 font-semibold" : status.includes("check") ? "text-violet-500 dark:text-yellow-400" : "text-gray-500 dark:text-zinc-400"}`}
          >
            {status ||
              `${player.charAt(0).toUpperCase() + player.slice(1)}'s turn`}
          </div>

          {/* Only show the waiting message, all other log messages are commented out */}
          {isOnline && onlineStatus && onlineStatus.includes("attente") && (
            <p className="text-xs tracking-wide text-center uppercase font-semibold text-violet-600 dark:text-yellow-400">
              {onlineStatus}
            </p>
          )}
          {/* {isOnline && onlineError && <p className="text-xs text-violet-500 dark:text-yellow-400 tracking-wide text-center">{onlineError}</p>} */}

          {/* Board */}
          <div className="p-2.5 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-2xl">
            <div className="flex items-start">
              <div
                className="flex flex-col justify-around pr-1.5 text-xs text-gray-600 dark:text-zinc-400 select-none"
                style={{ height: "480px" }}
              >
                {rankLabels.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              <div>
                <div
                  className="grid border border-gray-400 dark:border-zinc-600"
                  style={{
                    gridTemplateColumns: "repeat(8,60px)",
                    gridTemplateRows: "repeat(8,60px)",
                  }}
                >
                  {displayRows.map((r) =>
                    displayCols.map((c) => {
                      const piece = board[r][c];
                      const key = `${r},${c}`;
                      const isSel =
                        selected && selected[0] === r && selected[1] === c;
                      const isHint = hintSet.has(key) && !captureSet.has(key);
                      const isCap = captureSet.has(key);
                      const isLast =
                        lastMove &&
                        ((lastMove[0] === r && lastMove[1] === c) ||
                          (lastMove[2] === r && lastMove[3] === c));
                      const isDragOver =
                        dragOver && dragOver[0] === r && dragOver[1] === c;
                      const isDragSrc =
                        dragSource &&
                        dragSource[0] === r &&
                        dragSource[1] === c;
                      const isDraggable =
                        !!piece &&
                        isCurrentPlayerPiece(piece, player) &&
                        !gameOver &&
                        !pendingPromo;
                      const light = (r + c) % 2 === 0;
                      let bgClass = light ? "bg-amber-100" : "bg-amber-900";
                      if (isLast && !isSel)
                        bgClass = light ? "bg-yellow-300" : "bg-yellow-700";
                      if (isSel) bgClass = "bg-violet-400 dark:bg-yellow-500";
                      if (
                        isDragOver &&
                        (hintSet.has(key) || captureSet.has(key))
                      )
                        bgClass = light ? "bg-emerald-300" : "bg-emerald-600";
                      const isWhitePiece =
                        piece && piece === piece.toUpperCase();
                      const isBlackPiece =
                        piece && piece === piece.toLowerCase();
                      const pieceStyle = isWhitePiece
                        ? {
                            color: "#ffffff",
                            textShadow:
                              "-1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333",
                          }
                        : isBlackPiece
                          ? {
                              color: "#1a1a1a",
                              textShadow:
                                "-1px -1px 0 #aaa, 1px -1px 0 #aaa, -1px 1px 0 #aaa, 1px 1px 0 #aaa",
                            }
                          : {};
                      return (
                        <div
                          key={key}
                          className={`w-[60px] h-[60px] flex items-center justify-center text-[36px] select-none relative ${bgClass} hover:brightness-110 transition-all ${isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                          onClick={() => handleClick(r, c)}
                          draggable={isDraggable}
                          onDragStart={(e) => handleDragStart(e, r, c)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, r, c)}
                          onDrop={(e) => handleDrop(e, r, c)}
                        >
                          <span
                            style={{
                              ...pieceStyle,
                              opacity: isDragSrc ? 0.35 : 1,
                            }}
                          >
                            {PIECES[piece] || ""}
                          </span>
                          {isHint && !isDragOver && (
                            <span className="absolute w-[18px] h-[18px] rounded-full bg-violet-500/50 dark:bg-yellow-500/50 pointer-events-none" />
                          )}
                          {isCap && !isDragOver && (
                            <span className="absolute inset-0 border-[4px] border-violet-500/65 dark:border-yellow-500/65 pointer-events-none" />
                          )}
                        </div>
                      );
                    }),
                  )}
                </div>
                <div className="flex justify-around pt-1 text-xs text-gray-600 dark:text-zinc-400 select-none">
                  {fileLabels.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom clock */}
          {hasClock && (
            <div className="flex items-center gap-3 self-end">
              <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                {botClockLabel}
              </span>
              <Clock
                seconds={botClockSeconds}
                active={player === botClockPlayer && clockStarted && !gameOver}
                low={botClockSeconds <= lowThreshold}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-1">
            {!isOnline && (
              <>
                <button
                  onClick={() => setConfirmAction("restart")}
                  className="px-8 py-3 text-sm uppercase tracking-widest border border-violet-700 dark:border-yellow-700 text-violet-500 dark:text-yellow-400 rounded-md hover:bg-violet-700/20 dark:hover:bg-yellow-700/20 hover:border-violet-500 dark:hover:border-yellow-500 transition-all duration-200"
                >
                  Restart
                </button>
                <button
                  onClick={() => setConfirmAction("giveup")}
                  className="px-8 py-3 text-sm uppercase tracking-widest border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 rounded-md hover:bg-gray-300/30 dark:hover:bg-zinc-700/20 hover:border-gray-400 dark:hover:border-zinc-500 transition-all duration-200"
                >
                  ← Quitter
                </button>
              </>
            )}
            {isOnline && (
              <>
                <button
                  onClick={handleQuit}
                  className="px-8 py-3 text-sm uppercase tracking-widest border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 rounded-md hover:bg-gray-300/30 dark:hover:bg-zinc-700/20 hover:border-gray-400 dark:hover:border-zinc-500 transition-all duration-200"
                >
                  ← Quitter
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmAction && (
        <ConfirmModal
          message={
            confirmAction === "restart"
              ? "Relancer la partie ?"
              : confirmAction === "cancel"
                ? "Annuler la partie ? Elle sera supprimée."
                : isOnline && !gameOver
                  ? "Retourner au giveup ? Cela comptera comme une résignation."
                  : "Retourner au tableau de bord ?"
          }
          onConfirm={async () => {
            if (confirmAction === "restart") {
              reset();
              setConfirmAction(null);
            } else if (confirmAction === "cancel") {
              await handleCancelConfirm();
            } else {
              await handleGiveUpConfirm();
              console.log("Confirmed giveup/Leave");
            }
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Game summary popup — center overlay */}
      {gameResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
          <div className="bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl p-6 flex flex-col gap-4 shadow-2xl w-full max-w-sm mx-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400 pb-2 border-b border-gray-300 dark:border-zinc-700">
              Game summary
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                Result
              </span>
              <span
                className={`text-sm font-semibold ${gameResult.winner === "Draw" ? "text-gray-600 dark:text-zinc-300" : "text-violet-500 dark:text-yellow-400"}`}
              >
                {gameResult.winner === "Draw"
                  ? `Draw — ${gameResult.reason}`
                  : gameResult.reason === "resign" ||
                      gameResult.winner === "opponent"
                    ? "You win — opponent resigned"
                    : `${gameResult.winner} wins by ${gameResult.reason}`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center bg-gray-200 dark:bg-zinc-800 rounded-lg py-3">
                <span className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
                  Total
                </span>
                <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                  {history.length}
                </span>
              </div>
              <div className="flex flex-col items-center bg-gray-200 dark:bg-zinc-800 rounded-lg py-3">
                <span className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
                  White
                </span>
                <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                  {Math.ceil(history.length / 2)}
                </span>
              </div>
              <div className="flex flex-col items-center bg-gray-200 dark:bg-zinc-800 rounded-lg py-3">
                <span className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
                  Black
                </span>
                <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                  {Math.floor(history.length / 2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 text-center">
              Retour automatique dans 5s…
            </p>
            <button
              onClick={() => {
                if (redirectTimerRef.current)
                  clearTimeout(redirectTimerRef.current);
                onBack();
              }}
              className="w-full py-3 text-sm uppercase tracking-widest bg-violet-600 dark:bg-yellow-600 text-white rounded-md hover:bg-violet-500 dark:hover:bg-yellow-500 transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Promotion modal */}
      {pendingPromo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl">
            <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-zinc-400">
              Promote pawn
            </p>
            <div className="flex gap-3">
              {(pendingPromo.isWhite
                ? ["Q", "R", "B", "N"]
                : ["q", "r", "b", "n"]
              ).map((p) => (
                <div
                  key={p}
                  onClick={() => selectPromo(p)}
                  className="w-16 h-16 flex items-center justify-center text-4xl bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-violet-500 dark:hover:border-yellow-500 hover:bg-violet-500/10 dark:hover:bg-yellow-500/10 transition-all"
                >
                  {PIECES[p]}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Mode = "Local" | "En ligne" | null;
type TimeControl = "Bullet" | "Blitz" | "Normal" | null;
type Color = "Blanc" | "Noir" | null;

const GAME_VIEW_STORAGE_KEY = "ft_transcendence:game:view-state";

type PersistedGameViewState = {
  showChess: boolean;
  mode: Mode;
  timeControl: TimeControl;
  color: Color;
  activeGameId: number | null;
  activeGameStatus: "PENDING" | "ONGOING" | "COMPLETED" | null;
  onlinePlayerColor: "WHITE" | "BLACK" | null;
};

function getInitialGameViewState(): PersistedGameViewState {
  const defaults: PersistedGameViewState = {
    showChess: false,
    mode: "Local",
    timeControl: "Normal",
    color: "Blanc",
    activeGameId: null,
    activeGameStatus: null,
    onlinePlayerColor: null,
  };

  try {
    const raw = localStorage.getItem(GAME_VIEW_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<PersistedGameViewState>;
    if (!parsed || parsed.showChess !== true) return defaults;
    return {
      ...defaults,
      ...parsed,
      showChess: true,
    };
  } catch {
    return defaults;
  }
}

function Game() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialGameViewStateRef = useRef<PersistedGameViewState>(
    getInitialGameViewState(),
  );
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showChess, setShowChess] = useState(
    initialGameViewStateRef.current.showChess,
  );
  // Pre-selected defaults: Local, Normal (Classic), Blanc
  const [mode, setMode] = useState<Mode>(initialGameViewStateRef.current.mode);
  const [timeControl, setTimeControl] = useState<TimeControl>(
    initialGameViewStateRef.current.timeControl,
  );
  const [color, setColor] = useState<Color>(
    initialGameViewStateRef.current.color,
  );
  const [gameIdInput, setGameIdInput] = useState("");
  const [activeGameId, setActiveGameId] = useState<number | null>(
    initialGameViewStateRef.current.activeGameId,
  );
  const [activeGameStatus, setActiveGameStatus] = useState<
    "PENDING" | "ONGOING" | "COMPLETED" | null
  >(initialGameViewStateRef.current.activeGameStatus);
  const [onlinePlayerColor, setOnlinePlayerColor] = useState<
    "WHITE" | "BLACK" | null
  >(initialGameViewStateRef.current.onlinePlayerColor);
  const [pendingGames, setPendingGames] = useState<PendingGame[]>([]);
  const [isLoadingPendingGames, setIsLoadingPendingGames] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  const btnBase =
    "w-44 py-3 rounded-md text-base font-semibold border transition";
  const btnActive =
    "bg-violet-500 dark:bg-yellow-600 text-white border-violet-500 dark:border-yellow-600 hover:bg-violet-400 dark:hover:bg-yellow-500";
  const btnInactive =
    "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border-gray-300 dark:border-zinc-700 hover:border-violet-500 hover:text-violet-500 dark:hover:border-yellow-500 dark:hover:text-yellow-400";
  const btnDisabled =
    "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border-gray-200 dark:border-zinc-700 cursor-not-allowed opacity-70";

  const colorDisabled = mode === "Local";

  const loadPendingGames = useCallback(async () => {
    setIsLoadingPendingGames(true);
    try {
      const games = await getPendingGames();
      setPendingGames(games);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de charger les parties en attente.";
      setMenuError(message);
    } finally {
      setIsLoadingPendingGames(false);
    }
  }, []);

  useEffect(() => {
    if (!showCreateOptions && !showChess) {
      void loadPendingGames();
    }
  }, [showCreateOptions, showChess, loadPendingGames]);

  useEffect(() => {
    if (!showChess) {
      localStorage.removeItem(GAME_VIEW_STORAGE_KEY);
      return;
    }

    const stateToPersist: PersistedGameViewState = {
      showChess,
      mode,
      timeControl,
      color,
      activeGameId,
      activeGameStatus,
      onlinePlayerColor,
    };
    localStorage.setItem(GAME_VIEW_STORAGE_KEY, JSON.stringify(stateToPersist));
  }, [
    showChess,
    mode,
    timeControl,
    color,
    activeGameId,
    activeGameStatus,
    onlinePlayerColor,
  ]);

  function handleBack() {
    setShowChess(false);
    setShowCreateOptions(false);
    // Reset to defaults
    setMode("Local");
    setTimeControl("Normal");
    setColor("Blanc");
    setActiveGameId(null);
    setActiveGameStatus(null);
    setOnlinePlayerColor(null);
    setGameIdInput("");
    setMenuError(null);
    navigate("/game");
  }

  async function handleCreateGame() {
    if (!mode || !timeControl) {
      setMenuError("Choisis le mode et le timer.");
      return;
    }
    if (mode === "Local") {
      setMenuError(null);
      setShowChess(true);
      return;
    }
    if (!color) {
      setMenuError("Choisis ta couleur.");
      return;
    }
    try {
      const created = await createGame({
        playerColor: color === "Blanc" ? "WHITE" : "BLACK",
        gameMode:
          timeControl === "Bullet"
            ? "BULLET"
            : timeControl === "Blitz"
              ? "BLITZ"
              : "CLASSIC",
      });
      if (!created || typeof created.gameId !== "number") {
        throw new Error(
          "Réponse invalide du serveur lors de la création de partie.",
        );
      }
      setActiveGameId(created.gameId);
      setActiveGameStatus("PENDING");
      setOnlinePlayerColor(color === "Blanc" ? "WHITE" : "BLACK");
      setMenuError(null);
      setShowChess(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Création de partie impossible.";
      setMenuError(message);
    }
  }

  async function openJoinedGame(gameId: number) {
    await joinGame(gameId);
    const session = await getGameSession(gameId);
    setActiveGameId(gameId);
    setActiveGameStatus(session.gameStatus);
    setOnlinePlayerColor(session.playerColor);
    setTimeControl(
      session.gameMode === "BULLET"
        ? "Bullet"
        : session.gameMode === "BLITZ"
          ? "Blitz"
          : "Normal",
    );
    setMode("En ligne");
    setColor(session.playerColor === "WHITE" ? "Blanc" : "Noir");
    setMenuError(null);
    setShowChess(true);
  }

  async function handleJoinExistingGame(gameIdOverride?: number) {
    const gameId = gameIdOverride ?? Number.parseInt(gameIdInput, 10);
    if (!Number.isFinite(gameId) || gameId <= 0) {
      setMenuError("ID de partie invalide.");
      return;
    }
    try {
      await openJoinedGame(gameId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de rejoindre la partie.";
      setMenuError(message);
    }
  }

  if (showChess) {
    return (
      <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 min-w-max transition-colors duration-300">
        <div className="text-black dark:text-zinc-100">
          <Header title="Chess" />
        </div>
        <ChessGame
          onBack={handleBack}
          timeControl={timeControl!}
          online={{
            enabled: mode === "En ligne",
            gameId: activeGameId,
            playerColor: onlinePlayerColor,
            gameStatus: activeGameStatus,
          }}
          activeGameStatus={activeGameStatus}
        />
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 min-w-max transition-colors duration-300">
      <div className="text-black dark:text-zinc-100">
        <Header title="Démarrez une partie !" />
      </div>
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        {!showCreateOptions ? (
          <div className="flex flex-col gap-6 items-center w-full max-w-3xl px-6">
            <div className="flex flex-row gap-4">
              <button
                onClick={() => setShowCreateOptions(true)}
                className="w-64 py-3 text-base font-semibold bg-violet-500 dark:bg-yellow-600 text-white rounded-md hover:bg-violet-400 dark:hover:bg-yellow-500 transition"
              >
                Créer une partie
              </button>
              <button
                onClick={() => handleJoinExistingGame()}
                className="w-64 py-3 text-base font-semibold border border-gray-400 dark:border-zinc-700 rounded-md text-black dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition"
              >
                Rejoindre une partie
              </button>
            </div>
            <input
              type="text"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              placeholder="ID de partie"
              className="w-64 rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 text-black dark:text-zinc-100 bg-white dark:bg-zinc-900"
            />
            <div className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                    Parties en attente
                  </p>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    Rejoins directement une partie sans saisir d'identifiant.
                  </p>
                </div>
                <button
                  onClick={() => void loadPendingGames()}
                  className="button"
                >
                  Rafraîchir
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {isLoadingPendingGames && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Chargement des parties en attente...
                  </p>
                )}
                {!isLoadingPendingGames && pendingGames.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Aucune partie en attente pour le moment.
                  </p>
                )}
                {!isLoadingPendingGames &&
                  pendingGames.map((pendingGame) => (
                    <div
                      key={pendingGame.gameId}
                      className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 dark:border-zinc-700 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-100">
                          Partie #{pendingGame.gameId}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-zinc-300">
                          {pendingGame.gameMode} · {pendingGame.creatorName} en{" "}
                          {pendingGame.creatorColor === "WHITE"
                            ? "blanc"
                            : "noir"}
                        </p>
                      </div>
                      <button
                        disabled={pendingGame.creatorId === user?.id}
                        onClick={() =>
                          void handleJoinExistingGame(pendingGame.gameId)
                        }
                        className={`px-4 py-2 rounded-md text-sm transition ${pendingGame.creatorId === user?.id ? "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed" : "bg-violet-500 dark:bg-yellow-600 text-white hover:bg-violet-400 dark:hover:bg-yellow-500"}`}
                      >
                        {pendingGame.creatorId === user?.id
                          ? "Ta partie"
                          : "Rejoindre"}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            {menuError && (
              <p className="text-sm text-violet-600 dark:text-yellow-400">
                {menuError}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-row gap-4">
              {(["Local", "En ligne"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    if (m === "Local") setColor("Blanc");
                  }}
                  className={`${btnBase} ${mode === m ? btnActive : btnInactive}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex flex-row gap-4">
              {(["Bullet", "Blitz", "Normal"] as TimeControl[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeControl(t)}
                  className={`${btnBase} ${timeControl === t ? btnActive : btnInactive}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex flex-row gap-4">
              {(["Blanc", "Noir"] as Color[]).map((c) => (
                <button
                  key={c}
                  disabled={colorDisabled}
                  onClick={() => !colorDisabled && setColor(c)}
                  className={`${btnBase} ${colorDisabled ? btnDisabled : color === c ? btnActive : btnInactive}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreateGame}
              className="mt-2 w-56 py-3 text-base font-semibold bg-violet-500 dark:bg-yellow-600 text-white rounded-md hover:bg-violet-400 dark:hover:bg-yellow-500 transition"
            >
              Commencer
            </button>
            {menuError && (
              <p className="text-sm text-violet-600 dark:text-yellow-400">
                {menuError}
              </p>
            )}
            <button
              onClick={() => {
                setShowCreateOptions(false);
                setMode("Local");
                setTimeControl("Normal");
                setColor("Blanc");
                setMenuError(null);
              }}
              className="px-6 py-2 text-sm font-medium border border-violet-300 dark:border-yellow-700 text-violet-500 dark:text-yellow-400 rounded-md hover:bg-violet-50 dark:hover:bg-yellow-900/30 hover:border-violet-500 dark:hover:border-yellow-500 transition"
            >
              ← Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
