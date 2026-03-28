import { useState, useCallback } from "react";
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
function canCastle(b, r, c, dc, moved, player, ep) {
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
function toNotation(sr, sc, dr, dc, piece, target, boardAfter, nextPlayer, ep) {
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
function applyMove(b, sr, sc, dr, dc, moved, ep, halfmove) {
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

export default function Chess() {
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

  const reset = useCallback(() => {
    setBoard(INIT_BOARD()); setPlayer("white"); setSelected(null);
    setMoved(INIT_MOVED()); setEp(null); setHalfmove(0);
    setHistory([]); setGameOver(false); setStatus("");
    setPendingPromo(null); setHints([]); setLastMove(null);
  }, []);

  function evalState(b, next, m, newEp, hm) {
    if (hm>=100) { setStatus("Draw — 50-move rule"); setGameOver(true); return; }
    const inChk=isInCheck(b,next,newEp), hasL=hasAnyLegalMoves(b,next,m,newEp);
    if (inChk&&!hasL) { setStatus(`Checkmate — ${next==="white"?"Black":"White"} wins!`); setGameOver(true); }
    else if (!inChk&&!hasL) { setStatus("Stalemate — Draw"); setGameOver(true); }
    else if (inChk) setStatus(`${next==="white"?"White":"Black"} is in check!`);
    else setStatus("");
  }

  function handleClick(r, c) {
    if (gameOver||pendingPromo) return;
    const piece=board[r][c];
    if (selected) {
      const [sr,sc]=selected;
      if (isLegalMove(board,sr,sc,r,c,player,moved,ep)) {
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

  const hintSet    = new Set(hints.map(h=>`${h.row},${h.col}`));
  const captureSet = new Set(hints.filter(h=>h.capture).map(h=>`${h.row},${h.col}`));

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Header title="Chess" />

      <div className="flex gap-6 p-6 justify-center items-start flex-wrap">

        {/* Move history */}
        <div className="w-36 bg-gray-900 border border-gray-700 rounded-lg p-4 min-h-64">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 pb-2 border-b border-gray-700">
            Moves
          </p>
          <div className="text-sm leading-relaxed break-words">
            {history.map((m, i) =>
              i % 2 === 0
                ? <span key={i} className="text-gray-500">{Math.floor(i/2)+1}. <span className="text-gray-300">{m} </span></span>
                : <span key={i} className="text-gray-300">{m} </span>
            )}
          </div>
        </div>

        {/* Board area */}
        <div className="flex flex-col items-center gap-4">

          {/* Player indicators */}
          <div className="flex items-center gap-4">
            <span className={`text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all duration-200
              ${player==="black"&&!gameOver
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-gray-700 text-gray-500"}`}>
              Black
            </span>
            <span className="text-xs text-gray-600 tracking-widest">vs</span>
            <span className={`text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all duration-200
              ${player==="white"&&!gameOver
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-gray-700 text-gray-500"}`}>
              White
            </span>
          </div>

          {/* Status bar */}
          <div className={`text-xs uppercase tracking-widest h-5 text-center transition-colors
            ${gameOver
              ? "text-rose-400 font-semibold"
              : status.includes("check")
              ? "text-rose-400"
              : "text-gray-500"}`}>
            {status || `${player.charAt(0).toUpperCase()+player.slice(1)}'s turn`}
          </div>

          {/* Board */}
          <div className="p-2.5 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
            <div className="flex items-start">
              {/* Rank labels */}
              <div className="flex flex-col justify-around pr-1.5 text-xs text-gray-600 select-none" style={{height:"480px"}}>
                {[8,7,6,5,4,3,2,1].map(n=><span key={n}>{n}</span>)}
              </div>

              <div>
                {/* Squares */}
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

                      // background
                      let bgClass = light ? "bg-amber-100" : "bg-amber-900";
                      if (isLast && !isSel) bgClass = light ? "bg-yellow-300" : "bg-yellow-700";
                      if (isSel) bgClass = "bg-rose-400";

                      return (
                        <div
                          key={key}
                          className={`w-[60px] h-[60px] flex items-center justify-center text-[36px] cursor-pointer select-none relative ${bgClass} hover:brightness-110 transition-all`}
                          onClick={()=>handleClick(r,c)}
                        >
                          {PIECES[piece]||""}
                          {isHint && (
                            <span className="absolute w-[18px] h-[18px] rounded-full bg-rose-500/50 pointer-events-none" />
                          )}
                          {isCap && (
                            <span className="absolute inset-0 border-[4px] border-rose-500/65 pointer-events-none" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* File labels */}
                <div className="flex justify-around pt-1 text-xs text-gray-600 select-none">
                  {["a","b","c","d","e","f","g","h"].map(l=><span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Restart button */}
          <button
            onClick={reset}
            className="px-6 py-2 text-xs uppercase tracking-widest border border-rose-700 text-rose-400 rounded hover:bg-rose-700/20 hover:border-rose-500 transition-all duration-200"
          >
            Restart Game
          </button>
        </div>
      </div>

      {/* Promotion modal */}
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
