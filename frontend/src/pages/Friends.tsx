import Header from "../components/Header.tsx";
import { useFriends } from "../hooks/useFriends.ts";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import Search from "../components/Search.tsx";

//test
import { friendsData } from "../data/sideBarData.ts";
import statusData from "../data/statusData.ts";

function Friends() {
  const { friendsList, isLoading, error, addFriend, removeFriend } = useFriends();
  const [FriendsSearch, setFriendsSearch] = useState<string>("");
  const [NewFriendsSearch, setNewFriendsSearch] = useState<string>("");
  
  const normalizedFriendsSearch = FriendsSearch.trim().toLowerCase();
  const filteredFriends = normalizedFriendsSearch.length === 0
    ? friendsData
    : friendsData.filter((f) => f.pseudo.toLowerCase().includes(normalizedFriendsSearch))

  return (
    <div className="border rounded-md bg-white text-black h-full">
      <Header title="Listes de vos relations" />

      <section className="min-h-screen grid grid-cols-3 gap-4 m-3">
        {/* colonne de gauche */}
        <section className="border border-violet-300 max-h-screen overflow-y-auto">
          <div className="sticky top-0 z-20 bg-white">
            {/* Titre */}
            <p className="p-2 border-b">Liste d'amis</p>
            {/* Barre de recherche */}
            <Search value={FriendsSearch} onChange={setFriendsSearch} />
          </div>
          {/* Liste d'amis */}
          {filteredFriends.map((f) => {
            const friendStatus = statusData.find((st) => st.value === f.status);
            return (
              <div key={f.id} className="flex items-center border-b p-4">
                {/* changer pour avoir le vrai avatar */}
                <div className="flex-1">
                  <FontAwesomeIcon
                    icon={f.avatar}
                    className="text-4xl text-gray-300"
                  />
                  <div>
                    <p>{f.pseudo}</p>
                    <p className={`${friendStatus.style} w-fit`}>
                      {friendStatus.label}
                    </p>
                  </div>
                </div>
                <div>
                  <button>
                    <FontAwesomeIcon
                      icon={faBan}
                      className="hover:text-red-600"
                    />
                  </button>
                  <button>
                    <FontAwesomeIcon
                        icon={faStarRegular as IconProp}
                        className="hover:text-yellow-500"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        <section className="border border-gray-300">
          <p className="p-2 ">Ajouter de nouveaux amis</p>
        <Search value={NewFriendsSearch} onChange={setNewFriendsSearch} />
        </section>

        <section className="border border-red-300">
          <p className="p-2 ">Liste d'utilisateur bloqués</p>
        </section>
      </section>
    </div>
  );
}

export default Friends;
