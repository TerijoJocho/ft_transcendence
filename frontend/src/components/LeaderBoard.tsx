import * as api from "../api/api.ts";
import type { LeaderboardResponse } from "../api/api.ts";
import { useEffect, useState } from "react";

export default function LeaderBoard() {
  const [LeaderBoard, setLeaderBoard] = useState<LeaderboardResponse[]>([]);

  useEffect(() => {
    try {
      async function fetLeaderBoard() {
        const data = await api.getLeaderboard();
        setLeaderBoard(data);
      }
      fetLeaderBoard();
    } catch (error) {
      console.log(error);
    }
  }, []);

  // Map leaderboard data to list items for display
  const displayData = LeaderBoard.map((data, i) => {
    return (
      <li
        key={data?.playerId}
        className="grid grid-cols-3 gap-4 p-2 border border-transparent hover:border-violet-400 bg-violet-200 rounded-md m-1 items-center text-center"
      >
        <p>{i + 1}</p>
        <p>{data?.playerName}</p>
        <p>{data?.playerLevel}</p>
      </li>
    );
  });

  return (
    <section className="grid-style col-span-2 row-span-1">
      <h3>LeaderBoard</h3>
      <div className="border rounded-md m-2 p-1 bg-violet-100">
        <div className="grid grid-cols-3 gap-4 border-b-2 border-black m-1 p-2 font-semibold text-center">
          <p>Rang</p>
          <p>Joueur</p>
          <p>Nb. Parties gagnées</p>
        </div>
        <ul className="max-h-36 overflow-scroll">{displayData}</ul>
      </div>
    </section>
  );
}
