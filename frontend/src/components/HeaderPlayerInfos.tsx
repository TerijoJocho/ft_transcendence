import { useState, useEffect, useRef } from "react";
import statusData from "../data/statusData.ts";

import Level from "../components/Level.tsx";

import * as api from "../api/api.ts";

export default function HeaderPlayerInfos({ userStats, setUserStats }) {
  const dropDownWrapper = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [avatar, setAvatar] = useState("");

  //fetch le user au mount du composant
  useEffect(() => {
    async function fetchUser() {
      const userData = await api.me();
      setAvatar(userData.avatarUrl);
    }
    fetchUser();
  });

  //ferme le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropDownWrapper.current &&
        !dropDownWrapper.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //si le user n'a pas encore été fetch
  //early return
  if (!userStats) {
    return (
      <header className="flex justify-end items-center m-2">
        Chargement...
      </header>
    );
  }

  //change le status du user d'apres celui qu'il a selectionné
  // changement de statut a gerer que dans le frontend avec websocket
  function handleChangeStatus(value: string) {
    setIsOpen((prev) => !prev);
    setUserStats((prev) => (prev ? { ...prev, status: value } : prev));
  }

  //créer les boutons du menu status
  const displayStatus = statusData.map((st) => {
    return (
      <button
        key={st.id}
        id={st.id.toString()}
        className={st.style}
        value={st.value}
        onClick={() => handleChangeStatus(st.value)}
      >
        {st.label}
      </button>
    );
  });

  //affiche le status actuel du user
  const currentUserStatus = statusData.find(
    (st) => st.value === userStats.status,
  );
  const userAvatar = (
    <img
      src={avatar}
      alt={`${userStats.pseudo} avatar`}
      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover m-2 border border-violet-200"
    />
  );

  return (
    <header className="flex flex-row justify-end items-start sm:items-center m-2 mt-7 relative text-[#141301] dark:text-zinc-100 gap-2">
      <p className="flex-1 title-style text-base sm:text-2xl">
        Bienvenue sur ChessWar
      </p>
      <div className="flex flex-col">
        <h3 className="text-base sm:text-2xl lg:text-lg self-end">
          {userStats.pseudo ? userStats.pseudo : "UserName"}
        </h3>

        <Level level={userStats.winCount ?? 0} compact />

        <div ref={dropDownWrapper} className="self-end">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`${currentUserStatus?.style} max-w-fit self-end`}
          >
            {currentUserStatus?.label}
          </button>

          {isOpen && (
            <nav
              className="
                                flex flex-col gap-2 
                                absolute right-0 top-full mt-1
                                bg-black/5 dark:bg-zinc-900/70 backdrop-blur-sm border border-black/5 dark:border-zinc-700
                                rounded-2xl shadow-xl
                                p-2 z-50
                            "
            >
              {displayStatus}
            </nav>
          )}
        </div>
      </div>
      {userAvatar}
    </header>
  );
}
