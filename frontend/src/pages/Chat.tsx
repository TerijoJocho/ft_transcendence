import { useState } from 'react';
import Header from '../components/Header.tsx';
// import { useChat } from '../hooks/useChat';
import type {User} from "../auth/core/authCore.ts";
import statusData from "../data/statusData.ts";

function Chat() {
    let isConnected = true;

    const users: User[] = [
        {
            id: 1,
            pseudo: "AlphaKnight",
            elo: 1580,
            status: "ONLINE",
            avatar: "/avatars/alpha.png",
        },
        {
            id: 2,
            pseudo: "BlitzQueen",
            elo: 1725,
            status: "IN_GAME",
            avatar: "/avatars/blitz.png",
        },
        {
            id: 3,
            pseudo: "RookMaster",
            elo: 1490,
            status: "AWAY",
            avatar: "/avatars/rook.png",
        },
        {
            id: 4,
            pseudo: "PawnStorm",
            elo: 1310,
            status: "OFFLINE",
            avatar: "/avatars/pawn.png",
        },
        {
            id: 5,
            pseudo: "MateHunter",
            elo: 1902,
            status: "DO_NOT_DISTURB",
            avatar: "/avatars/mate.png",
        },
    ];

    const displayConv = users.map(user => {
        const {id, pseudo, status} = user;
        const currStatus = statusData.find(st => st.value === status) ?? statusData[0];
        return (
            <div key={id} className='flex p-6 mb-4 border rounded-md bg-white'>
                <p className='flex-1'>{pseudo}</p>
                <div className={`${currStatus.style} w-2 h-2 rounded-full self-center mt-1`}></div>
            </div>
        )
    })

    return (
        <div className="border rounded-md bg-white text-black h-full">
            <Header 
                title="Messages privés"
            />
            <section className="m-4 p-4 bg-slate-100 min-h-screen rounded-lg">
                {/* Affichage des conversation */}
                {displayConv}
            </section>
        </div>
    );
}

export default Chat;