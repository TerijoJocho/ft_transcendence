import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";

const PIECES = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙",
};

const INIT_BOARD = () => [
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["P","P","P","P","P","P","P","P"],
  ["R","N","B","Q","K","B","N","R"],
];
const INIT_MOVED = () => ({ K:false,R0:false,R7:false,k:false,r0:false,r7:false });

function isCurrentPlayerPiece(p, player) {
  return player === "white" ? p === p.toUpperCase() : p === p.toLowerCase();
}
function isPathClear(b, sr, sc, dr, dc) {
  const rs=Math.sign(dr-sr), cs=Math.sign(dc-sc);
  let r=sr+rs, c=sc+cs;
  while (r!==dr||c!==dc) { if (b[r][c]!=="") return false; r+=rs; c+=cs; }
  return true;
}
function isValidPieceMove(b, sr, sc, dr, dc, ep) {
  const p=b[sr][sc], t=b[dr][dc], rd=dr-sr, cd=dc-sc;
  switch (p.toLowerCase()) {
    case "p": {
      const dir=p==="P"?-1:1, start=p==="P"?6:1;
      if (cd===0&&!t) { if (rd===dir) return true; if (sr===start&&rd===2*dir&&!b[sr+dir][sc]) return true; }
      if (Math.abs(cd)===1&&rd===dir) { if (t) return true; if (ep&&ep.row===dr&&ep.col===dc) return true; }
      return false;
    }
    case "r": if (rd&&cd) return false; return isPathClear(b,sr,sc,dr,dc);
    case "n": return (Math.abs(rd)===2&&Math.abs(cd)===1)||(Math.abs(rd)===1&&Math.abs(cd)===2);
    case "b": if (Math.abs(rd)!==Math.abs(cd)) return false; return isPathClear(b,sr,sc,dr,dc);
    case "q": if (rd===0||cd===0||Math.abs(rd)===Math.abs(cd)) return isPathClear(b,sr,sc,dr,dc); return false;
    case "k": if (Math.abs(rd)<=1&&Math.abs(cd)<=1) return true; return false;
    default: return false;
  }
}
function isInCheck(b, player, ep) {
  const k=player==="white"?"K":"k"; let kr, kc;
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) if (b[r][c]===k){kr=r;kc=c;}
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const p=b[r][c]; if (!p) continue;
    if ((player==="white"?p===p.toLowerCase():p===p.toUpperCase())&&isValidPieceMove(b,r,c,kr,kc,ep)) return true;
  }
  return false;
}
function isSquareAttacked(b, r, c, byWhite, ep) {
  for (let i=0;i<8;i++) for (let j=0;j<8;j++) {
    const p=b[i][j]; if (!p) continue;
    if ((byWhite?p===p.toUpperCase():p===p.toLowerCase())&&isValidPieceMove(b,i,j,r,c,ep)) return true;
  }
  return false;
}
function canCastle(b, r, _c, dc, moved, player, ep) {
  const w=player==="white";
  if ((w&&moved.K)||(!w&&moved.k)) return false;
  if (dc===6) {
    if ((w&&moved.R7)||(!w&&moved.r7)) return false;
    if (b[r][5]||b[r][6]) return false;
    if (isSquareAttacked(b,r,4,!w,ep)||isSquareAttacked(b,r,5,!w,ep)||isSquareAttacked(b,r,6,!w,ep)) return false;
    return true;
  }
  if (dc===2) {
    if ((w&&moved.R0)||(!w&&moved.r0)) return false;
    if (b[r][1]||b[r][2]||b[r][3]) return false;
    if (isSquareAttacked(b,r,4,!w,ep)||isSquareAttacked(b,r,3,!w,ep)||isSquareAttacked(b,r,2,!w,ep)) return false;
    return true;
  }
  return false;
}
function isLegalMove(b, sr, sc, dr, dc, player, moved, ep) {
  if (sr===dr&&sc===dc) return false;
  const p=b[sr][sc], t=b[dr][dc]; if (!p) return false;
  if (t&&isCurrentPlayerPiece(t,player)) return false;
  if (p.toLowerCase()==="k"&&Math.abs(dc-sc)===2) { if (!canCastle(b,sr,sc,dc,moved,player,ep)) return false; }
  else if (!isValidPieceMove(b,sr,sc,dr,dc,ep)) return false;
  const nb=b.map(r=>r.slice());
  if (p.toLowerCase()==="p"&&dc!==sc&&!nb[dr][dc]) nb[sr][dc]="";
  if (p.toLowerCase()==="k"&&Math.abs(dc-sc)===2) {
    if (dc===6){nb[sr][5]=nb[sr][7];nb[sr][7]="";}
    if (dc===2){nb[sr][3]=nb[sr][0];nb[sr][0]="";}
  }
  nb[dr][dc]=nb[sr][sc]; nb[sr][sc]="";
  return !isInCheck(nb,player,null);
}
function getLegalMoves(b, r, c, player, moved, ep) {
  const moves=[];
  for (let dr=0;dr<8;dr++) for (let dc=0;dc<8;dc++)
    if (isLegalMove(b,r,c,dr,dc,player,moved,ep)) moves.push({row:dr,col:dc,capture:b[dr][dc]!==""});
  return moves;
}
function hasAnyLegalMoves(b, player, moved, ep) {
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const p=b[r][c]; if (!p||!isCurrentPlayerPiece(p,player)) continue;
    if (getLegalMoves(b,r,c,player,moved,ep).length>0) return true;
  }
  return false;
}
function toNotation(_sr, sc, dr, dc, piece, target, boardAfter, nextPlayer, ep) {
  const isPawn=piece.toLowerCase()==="p", isCapture=target!==""||(isPawn&&sc!==dc);
  let n="";
  if (piece.toLowerCase()==="k"&&Math.abs(dc-sc)===2) { n=dc===6?"O-O":"O-O-O"; }
  else {
    if (!isPawn) n+=piece.toUpperCase(); else if (isCapture) n+=String.fromCharCode(97+sc);
    if (isCapture) n+="x";
    n+=String.fromCharCode(97+dc)+(8-dr);
  }
  const inChk=isInCheck(boardAfter,nextPlayer,ep);
  const hasL=inChk&&hasAnyLegalMoves(boardAfter,nextPlayer,{},ep);
  if (inChk) n+=hasL?"+":"#";
  return n;
}
function applyMove(b, sr, sc, dr, dc, moved, _ep, halfmove) {
  const nb=b.map(r=>r.slice()), piece=nb[sr][sc], target=nb[dr][dc], pl=piece.toLowerCase();
  const newMoved={...moved};
  if (piece==="K") newMoved.K=true; if (piece==="k") newMoved.k=true;
  if (piece==="R"&&sr===7&&sc===0) newMoved.R0=true; if (piece==="R"&&sr===7&&sc===7) newMoved.R7=true;
  if (piece==="r"&&sr===0&&sc===0) newMoved.r0=true; if (piece==="r"&&sr===0&&sc===7) newMoved.r7=true;
  let newEp=null;
  if (pl==="p"&&Math.abs(dr-sr)===2) newEp={row:(sr+dr)/2,col:sc};
  if (pl==="p"&&dc!==sc&&nb[dr][dc]==="") nb[sr][dc]="";
  if (pl==="k"&&Math.abs(dc-sc)===2) {
    if (dc===6){nb[sr][5]=nb[sr][7];nb[sr][7]="";}
    if (dc===2){nb[sr][3]=nb[sr][0];nb[sr][0]="";}
  }
  nb[dr][dc]=nb[sr][sc]; nb[sr][sc]="";
  return { nb, piece, target, newMoved, newEp, newHalfmove:(pl==="p"||target!=="") ? 0 : halfmove+1 };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Clock({ seconds, active, low }: { seconds: number; active: boolean; low: boolean }) {
  return (
    <div className={`px-5 py-2 rounded-lg border font-mono text-2xl font-semibold tracking-widest transition-all duration-300
      ${low
        ? "border-rose-500 text-rose-400 bg-rose-500/10"
        : active
        ? "border-gray-400 text-white bg-gray-700"
        : "border-gray-700 text-gray-500 bg-gray-900"
      }`}>
      {formatTime(seconds)}
    </div>
  );
}


function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4">
        <p className="text-white text-center text-base font-medium">{message}</p>
        <div className="flex gap-4 w-full">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-sm uppercase tracking-widest border border-rose-700 text-rose-400 rounded-md hover:bg-rose-700/20 hover:border-rose-500 transition-all"
          >
            Confirmer
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm uppercase tracking-widest border border-gray-700 text-gray-400 rounded-md hover:bg-gray-700/20 hover:border-gray-500 transition-all"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function ChessGame({ onBack, timeControl }: { onBack: () => void; timeControl: string }) {
  const initSeconds = timeControl === "Bullet" ? 60 : timeControl === "Blitz" ? 300 : null;
  const hasClock = initSeconds !== null;

  const [board, setBoard]       = useState(INIT_BOARD);
  const [player, setPlayer]     = useState("white");
  const [selected, setSelected] = useState(null);
  const [moved, setMoved]       = useState(INIT_MOVED);
  const [ep, setEp]             = useState(null);
  const [halfmove, setHalfmove] = useState(0);
  const [history, setHistory]   = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus]     = useState("");
  const [pendingPromo, setPendingPromo] = useState(null);
  const [hints, setHints]       = useState([]);
  const [lastMove, setLastMove] = useState(null);

  const [whiteTime, setWhiteTime] = useState(initSeconds);
  const [blackTime, setBlackTime] = useState(initSeconds);
  const [clockStarted, setClockStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gameResult, setGameResult] = useState<{ winner: string; reason: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<"restart" | "menu" | null>(null);
  const [dragSource, setDragSource] = useState<[number, number] | null>(null);
  const [dragOver, setDragOver] = useState<[number, number] | null>(null);

  
  useEffect(() => {
    if (!hasClock || !clockStarted || gameOver) return;
    intervalRef.current = setInterval(() => {
      if (player === "white") {
        setWhiteTime(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setGameOver(true);
            setStatus("Time's up — Black wins!");
            setGameResult({ winner: "Black", reason: "timeout" });
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setGameOver(true);
            setStatus("Time's up — White wins!");
            setGameResult({ winner: "White", reason: "timeout" });
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [player, clockStarted, gameOver, hasClock]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current!);
    setBoard(INIT_BOARD()); setPlayer("white"); setSelected(null);
    setMoved(INIT_MOVED()); setEp(null); setHalfmove(0);
    setHistory([]); setGameOver(false); setStatus("");
    setPendingPromo(null); setHints([]); setLastMove(null);
    setWhiteTime(initSeconds); setBlackTime(initSeconds);
    setClockStarted(false); setGameResult(null);
    setDragSource(null); setDragOver(null);
  }, [initSeconds]);

  function evalState(b, next, m, newEp, hm) {
    if (hm>=100) { setStatus("Draw — 50-move rule"); setGameOver(true); setGameResult({ winner: "Draw", reason: "50-move rule" }); return; }
    const inChk=isInCheck(b,next,newEp), hasL=hasAnyLegalMoves(b,next,m,newEp);
    if (inChk&&!hasL) {
      const winner = next==="white" ? "Black" : "White";
      setStatus(`Checkmate — ${winner} wins!`); setGameOver(true);
      setGameResult({ winner, reason: "checkmate" });
    } else if (!inChk&&!hasL) {
      setStatus("Stalemate — Draw"); setGameOver(true);
      setGameResult({ winner: "Draw", reason: "stalemate" });
    } else if (inChk) setStatus(`${next==="white"?"White":"Black"} is in check!`);
    else setStatus("");
  }

  function handleClick(r, c) {
    if (gameOver||pendingPromo) return;
    const piece=board[r][c];
    if (selected) {
      const [sr,sc]=selected;
      if (isLegalMove(board,sr,sc,r,c,player,moved,ep)) {
        if (hasClock && !clockStarted) setClockStarted(true);
        const { nb,piece:mp,target,newMoved,newEp,newHalfmove } = applyMove(board,sr,sc,r,c,moved,ep,halfmove);
        setLastMove([sr,sc,r,c]); setSelected(null); setHints([]);
        if ((nb[r][c]==="P"&&r===0)||(nb[r][c]==="p"&&r===7)) {
          setBoard(nb); setMoved(newMoved); setEp(newEp); setHalfmove(newHalfmove);
          setPendingPromo({row:r,col:c,isWhite:nb[r][c]==="P",sr,sc,mp,target,nb,newMoved,newEp,newHalfmove});
          return;
        }
        const next=player==="white"?"black":"white";
        setHistory(h=>[...h, toNotation(sr,sc,r,c,mp,target,nb,next,newEp)]);
        setBoard(nb); setMoved(newMoved); setEp(newEp); setHalfmove(newHalfmove); setPlayer(next);
        evalState(nb,next,newMoved,newEp,newHalfmove);
      } else if (piece&&isCurrentPlayerPiece(piece,player)) {
        setSelected([r,c]); setHints(getLegalMoves(board,r,c,player,moved,ep));
      } else { setSelected(null); setHints([]); }
    } else if (piece&&isCurrentPlayerPiece(piece,player)) {
      setSelected([r,c]); setHints(getLegalMoves(board,r,c,player,moved,ep));
    }
  }

  function selectPromo(p) {
    if (!pendingPromo) return;
    const { row,col,sr,sc,mp,target,nb,newMoved,newEp,newHalfmove } = pendingPromo;
    const fb=nb.map(r=>r.slice()); fb[row][col]=p;
    const next=player==="white"?"black":"white";
    const n=toNotation(sr,sc,row,col,mp,target,fb,next,newEp)+"="+p.toUpperCase();
    setHistory(h=>[...h,n]); setBoard(fb); setMoved(newMoved); setEp(newEp);
    setHalfmove(newHalfmove); setPlayer(next); setPendingPromo(null);
    evalState(fb,next,newMoved,newEp,newHalfmove);
  }

  function handleDragStart(e: React.DragEvent, r: number, c: number) {
    if (gameOver || pendingPromo) { e.preventDefault(); return; }
    const piece = board[r][c];
    if (!piece || !isCurrentPlayerPiece(piece, player)) { e.preventDefault(); return; }
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
    if (sr === dr && sc === dc) return;
    if (!isLegalMove(board, sr, sc, dr, dc, player, moved, ep)) {
      setSelected(null); setHints([]);
      return;
    }
    if (hasClock && !clockStarted) setClockStarted(true);
    const { nb, piece: mp, target, newMoved, newEp, newHalfmove } = applyMove(board, sr, sc, dr, dc, moved, ep, halfmove);
    setLastMove([sr, sc, dr, dc]); setSelected(null); setHints([]);
    if ((nb[dr][dc] === "P" && dr === 0) || (nb[dr][dc] === "p" && dr === 7)) {
      setBoard(nb); setMoved(newMoved); setEp(newEp); setHalfmove(newHalfmove);
      setPendingPromo({ row: dr, col: dc, isWhite: nb[dr][dc] === "P", sr, sc, mp, target, nb, newMoved, newEp, newHalfmove });
      return;
    }
    const next = player === "white" ? "black" : "white";
    setHistory(h => [...h, toNotation(sr, sc, dr, dc, mp, target, nb, next, newEp)]);
    setBoard(nb); setMoved(newMoved); setEp(newEp); setHalfmove(newHalfmove); setPlayer(next);
    evalState(nb, next, newMoved, newEp, newHalfmove);
  }

  const hintSet    = new Set(hints.map(h=>`${h.row},${h.col}`));
  const captureSet = new Set(hints.filter(h=>h.capture).map(h=>`${h.row},${h.col}`));

  const lowThreshold = initSeconds ? Math.min(30, initSeconds * 0.2) : 30;

  return (
    <div className="text-white">
      <div className="flex gap-6 p-6 justify-center items-start flex-wrap">
        <div className="w-52 bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col" style={{height:"520px"}}>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 pb-2 border-b border-gray-700 flex-shrink-0">
            Moves
          </p>
          <div className="overflow-y-auto flex-1 flex flex-col gap-1 pr-1">
            {Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-gray-600 w-6 flex-shrink-0">{i + 1}.</span>
                <span className="text-gray-300 w-16">{history[i * 2] ?? ""}</span>
                <span className="text-gray-400 w-16">{history[i * 2 + 1] ?? ""}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          {hasClock && (
            <div className="flex items-center gap-3 self-end">
              <span className="text-xs uppercase tracking-widest text-gray-500">Black</span>
              <Clock
                seconds={blackTime!}
                active={player === "black" && clockStarted && !gameOver}
                low={blackTime! <= lowThreshold}
              />
            </div>
          )}
          {!hasClock && (
            <div className="flex items-center gap-4">
              <span className={`text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all duration-200
                ${player==="black"&&!gameOver ? "border-rose-500 text-rose-400 bg-rose-500/10" : "border-gray-700 text-gray-500"}`}>
                Black
              </span>
              <span className="text-xs text-gray-600 tracking-widest">vs</span>
              <span className={`text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all duration-200
                ${player==="white"&&!gameOver ? "border-rose-500 text-rose-400 bg-rose-500/10" : "border-gray-700 text-gray-500"}`}>
                White
              </span>
            </div>
          )}
          <div className={`text-xs uppercase tracking-widest h-5 text-center transition-colors
            ${gameOver ? "text-rose-400 font-semibold" : status.includes("check") ? "text-rose-400" : "text-gray-500"}`}>
            {status || `${player.charAt(0).toUpperCase()+player.slice(1)}'s turn`}
          </div>
          <div className="p-2.5 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
            <div className="flex items-start">
              <div className="flex flex-col justify-around pr-1.5 text-xs text-gray-600 select-none" style={{height:"480px"}}>
                {[8,7,6,5,4,3,2,1].map(n=><span key={n}>{n}</span>)}
              </div>
              <div>
                <div className="grid border border-gray-600"
                  style={{gridTemplateColumns:"repeat(8,60px)",gridTemplateRows:"repeat(8,60px)"}}>
                  {board.map((row, r) =>
                    row.map((piece, c) => {
                      const key=`${r},${c}`;
                      const isSel  = selected&&selected[0]===r&&selected[1]===c;
                      const isHint = hintSet.has(key)&&!captureSet.has(key);
                      const isCap  = captureSet.has(key);
                      const isLast = lastMove&&((lastMove[0]===r&&lastMove[1]===c)||(lastMove[2]===r&&lastMove[3]===c));
                      const light  = (r+c)%2===0;
                      let bgClass = light ? "bg-amber-100" : "bg-amber-900";
                      if (isLast && !isSel) bgClass = light ? "bg-yellow-300" : "bg-yellow-700";
                      if (isSel) bgClass = "bg-rose-400";
                      const isWhitePiece = piece && piece === piece.toUpperCase();
                      const isBlackPiece = piece && piece === piece.toLowerCase();
                      const pieceStyle = isWhitePiece
                        ? { color: "#ffffff", textShadow: "-1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333" }
                        : isBlackPiece
                        ? { color: "#1a1a1a", textShadow: "-1px -1px 0 #aaa, 1px -1px 0 #aaa, -1px 1px 0 #aaa, 1px 1px 0 #aaa" }
                        : {};
                      const isDragOver = dragOver && dragOver[0] === r && dragOver[1] === c;
                      const isDragSrc  = dragSource && dragSource[0] === r && dragSource[1] === c;
                      const isDraggable = !!piece && isCurrentPlayerPiece(piece, player) && !gameOver && !pendingPromo;
                      if (isDragOver && hintSet.has(key)) bgClass = light ? "bg-emerald-300" : "bg-emerald-600";
                      if (isDragOver && captureSet.has(key)) bgClass = light ? "bg-emerald-300" : "bg-emerald-600";
                      return (
                        <div
                          key={key}
                          className={`w-[60px] h-[60px] flex items-center justify-center text-[36px] select-none relative ${bgClass} hover:brightness-110 transition-all ${isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                          onClick={()=>handleClick(r,c)}
                          draggable={isDraggable}
                          onDragStart={e => handleDragStart(e, r, c)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => handleDragOver(e, r, c)}
                          onDrop={e => handleDrop(e, r, c)}
                        >
                          <span style={{ ...pieceStyle, opacity: isDragSrc ? 0.35 : 1 }}>{PIECES[piece]||""}</span>
                          {isHint && !isDragOver && <span className="absolute w-[18px] h-[18px] rounded-full bg-rose-500/50 pointer-events-none" />}
                          {isCap  && !isDragOver && <span className="absolute inset-0 border-[4px] border-rose-500/65 pointer-events-none" />}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex justify-around pt-1 text-xs text-gray-600 select-none">
                  {["a","b","c","d","e","f","g","h"].map(l=><span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>
          {hasClock && (
            <div className="flex items-center gap-3 self-end">
              <span className="text-xs uppercase tracking-widest text-gray-500">White</span>
              <Clock
                seconds={whiteTime!}
                active={player === "white" && clockStarted && !gameOver}
                low={whiteTime! <= lowThreshold}
              />
            </div>
          )}
          <div className="flex gap-4 mt-1">
            <button
              onClick={() => setConfirmAction("restart")}
              className="px-8 py-3 text-sm uppercase tracking-widest border border-rose-700 text-rose-400 rounded-md hover:bg-rose-700/20 hover:border-rose-500 transition-all duration-200"
            >
              Restart
            </button>
            <button
              onClick={() => setConfirmAction("menu")}
              className="px-8 py-3 text-sm uppercase tracking-widest border border-gray-700 text-gray-400 rounded-md hover:bg-gray-700/20 hover:border-gray-500 transition-all duration-200"
            >
              ← Menu
            </button>
          </div>
          {gameResult && (() => {
            const totalMoves = history.length;
            const whiteMoves = Math.ceil(totalMoves / 2);
            const blackMoves = Math.floor(totalMoves / 2);
            const isDraw = gameResult.winner === "Draw";
            return (
              <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">
                <p className="text-xs uppercase tracking-widest text-gray-500 pb-2 border-b border-gray-700">
                  Game summary
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Result</span>
                  <span className={`text-sm font-semibold ${isDraw ? "text-gray-300" : "text-rose-400"}`}>
                    {isDraw ? `Draw — ${gameResult.reason}` : `${gameResult.winner} wins by ${gameResult.reason}`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center bg-gray-800 rounded-lg py-3">
                    <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</span>
                    <span className="text-2xl font-semibold text-white">{totalMoves}</span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-800 rounded-lg py-3">
                    <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">White</span>
                    <span className="text-2xl font-semibold text-white">{whiteMoves}</span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-800 rounded-lg py-3">
                    <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Black</span>
                    <span className="text-2xl font-semibold text-white">{blackMoves}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      {confirmAction && (
        <ConfirmModal
          message={confirmAction === "restart" ? "Relancer la partie ?" : "Retourner au tableau de bord ?"}
          onConfirm={() => {
            if (confirmAction === "restart") { reset(); }
            else { onBack(); }
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {pendingPromo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">Promote pawn</p>
            <div className="flex gap-3">
              {(pendingPromo.isWhite?["Q","R","B","N"]:["q","r","b","n"]).map(p=>(
                <div
                  key={p}
                  onClick={()=>selectPromo(p)}
                  className="w-16 h-16 flex items-center justify-center text-4xl bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-rose-500 hover:bg-rose-500/10 transition-all"
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

function Game() {
  const navigate = useNavigate();
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showChess, setShowChess] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [timeControl, setTimeControl] = useState<TimeControl>(null);
  const [color, setColor] = useState<Color>(null);

  const btnBase = "w-44 py-5 rounded-xl text-xl font-semibold border transition";
  const btnActive = "bg-black text-white border-black";
  const btnInactive = "bg-transparent text-gray-500 border-gray-400 hover:border-black hover:text-black";
  const btnDisabled = "bg-transparent text-gray-600 border-gray-700 cursor-not-allowed opacity-50";

  const colorDisabled = mode === "Local";

  function handleBack() {
    setShowChess(false);
    setShowCreateOptions(false);
    setMode(null);
    setTimeControl(null);
    setColor(null);
    navigate("/dashboard");
  }

  if (showChess) {
    return (
      <div className="border min-w-max">
        <div className="text-black"><Header title="Chess" /></div>
        <ChessGame onBack={handleBack} timeControl={timeControl!} />
      </div>
    );
  }

  return (
    <div className="border min-w-max">
      <div className="text-black"><Header title="Démarrez une partie !" /></div>
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        {!showCreateOptions ? (
          <div className="flex flex-row gap-6">
            <button
              onClick={() => setShowCreateOptions(true)}
              className="w-64 py-3 text-lg font-semibold bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Créer une partie
            </button>
            <button
              disabled
              className="w-64 py-3 text-lg font-semibold border border-gray-300 rounded-md text-gray-400 cursor-not-allowed"
            >
              Rejoindre une partie
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-row gap-4">
              {(["Local", "En ligne"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); if (m === "Local") setColor(null); }}
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
              onClick={() => { if (mode === "Local") setShowChess(true); }}
              className="mt-2 w-56 py-5 text-xl font-semibold bg-white text-black rounded-xl hover:bg-gray-200 transition"
            >
              Commencer
            </button>

            <button
              onClick={() => {
                setShowCreateOptions(false);
                setMode(null);
                setTimeControl(null);
                setColor(null);
              }}
              className="text-sm text-gray-400 hover:text-white underline transition"
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
