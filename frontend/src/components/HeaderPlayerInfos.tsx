import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCircleUser} from '@fortawesome/free-solid-svg-icons';
import * as api from "../api/api.ts";

import { useState, useEffect, useRef } from 'react';
import statusData from "../data/statusData.ts";

import type {User} from "../auth/core/authCore.ts"

export default function HeaderPlayerInfos() {
    const dropDownWrapper = useRef<HTMLDivElement | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    //fetch le user au mount du composant
    //renvoie surement le userName: string, userAvatar: img (?), userStatus: ONLINE et les tokens, 
    useEffect(() => {
        async function fetchUser() {
            // const userData = await api.me();
            //pour le test
            const userData = {
                id: 1,
                pseudo: "UserNameTest",
                elo: 1634,
                status: "ONLINE",
                avatar: "",
            }
            setUser(userData);
        };
        fetchUser();
    }, []);

    //ferme le menu quand on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropDownWrapper.current && !dropDownWrapper.current.contains(event.target as Node))
                setIsOpen(false);
        }
        
        document.addEventListener('mousedown', handleClickOutside);

        return (() => {
            document.removeEventListener("mousedown", handleClickOutside);
        })
    }, []);

    //si le user n'a pas encore été fetch
    //early return
    if (!user)
    {
        return (
            <header className='flex justify-end items-center m-2'>
                Chargement...
            </header>
        );
    }

    //change le status du user d'apres celui qu'il a selectionné
    //update user.status in backend and state local in frontend
    function handleChangeStatus(value: string) {
        setIsOpen(prev => !prev);
        //fetch pour PATCH le status du user dans le backend
        async function patchStatus() {
            try {
                const response = await api.changeStatus({status: value});
                setUser(prev => {
                    if (!prev) return prev;
                    return ({
                        ...prev,
                        status: response.newStatus,
                    });
                });
            } catch (error) {
                console.error("Failed to change user status:", error);
            }
        };
        patchStatus();
    }

    //créer les boutons du menu status
    const displayStatus = statusData.map((st) => {
        return (
            <button key={st.id} id={st.id.toString()} className={st.style} value={st.value} onClick={() => handleChangeStatus(st.value)}>
                {st.label}
            </button>
        );
    })

    //affiche le status actuel du user
    const currentUserStatus = statusData.find((st) => st.value === user.status);

    return (
        <header className='flex justify-end items-center m-2 relative text-[#141301]'>
            <p className='flex-1 title-style'>Bienvenue sur ChessWar</p>
            <div className='flex flex-col'>
                <h3 className='text-sm self-end'>{user.pseudo ? user.pseudo : "UserName"}</h3>

                <p className='text-xs self-end'>{`Elo: ${user.elo}`}</p>

                <div ref={dropDownWrapper} className='self-end'>
                    <button onClick={() => setIsOpen(prev => !prev)} className={`${currentUserStatus.style} max-w-fit self-end`}>
                        {currentUserStatus.label}
                    </button>
                    
                    {isOpen && 
                        <nav                             
                            className='
                                flex flex-col gap-2 
                                absolute right-0 top-full mt-1
                                bg-black/5 backdrop-blur-sm border border-black/5
                                rounded-2xl shadow-xl
                                p-2 z-50
                            '
                            >
                            {displayStatus}
                        </nav>                    
                    }
                </div>
            </div>
            {
                user.avatar ? 
                    <img src={user.avatar} alt='user avatar' className=''/>
                :
                    <FontAwesomeIcon icon={faCircleUser} className='text-4xl m-1'/>
            }
        </header>
    );
}