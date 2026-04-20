import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect, useRef } from "react";
import statusData from "../data/statusData.ts";
import { mockDashboardUserStats } from "../data/mock_data";

import Level from "../components/Level.tsx";

// import * as api from '../api/api.ts';

export default function HeaderPlayerInfos({user, setUser}) {
  const dropDownWrapper = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  //fetch le user au mount du composant
  useEffect(() => {
    async function fetchUser() {
      // const userData = await api.me(); //utiliser le get de /user
      const userData = mockDashboardUserStats;
      setUser(userData);
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
  if (!user) {
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
    setUser((prev) => (prev ? { ...prev, status: value } : prev));
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
  const currentUserStatus = statusData.find((st) => st.value === user.status);
  const userAvatar =
    typeof user.avatar === "string" ? (
      <img
        src={user.avatar}
        alt={`${user.pseudo} avatar`}
        className="w-12 h-12 rounded-full object-cover m-2"
      />
    ) : (
      <FontAwesomeIcon icon={user.avatar ?? faCircleUser} className="w-12 h-12 rounded-full object-cover m-2" />
    );

  return (
    <header className="flex justify-end items-center m-2 relative text-[#141301]">
      <p className="flex-1 title-style">Bienvenue sur ChessWar</p>
      <div className="flex flex-col">
        <h3 className="text-lg self-end">
          {user.pseudo ? user.pseudo : "UserName"}
        </h3>

        <Level level={user.winCount}/>

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
                                bg-black/5 backdrop-blur-sm border border-black/5
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
