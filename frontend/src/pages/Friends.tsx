import Header from "../components/Header.tsx";
import { useFriends, type Friends as Friend } from "../hooks/useFriends.ts";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faUserMinus, faStar, faCheck, faCircleUser } from "@fortawesome/free-solid-svg-icons";
import Search from "../components/Search.tsx";
import AddFriend from "../components/AddFriends.tsx";
import statusData from "../data/statusData.ts";

function Friends() {
  const { friendsList, isLoading, error, toggleFavFriend, removeFriend, blockUser, unblockUser } = useFriends();
  const [friendsSearch, setFriendsSearch] = useState<string>("");
  const [banSearch, setBanSearch] = useState<string>("");
  
  //liste des amis
  const normalizedFriendsSearch = friendsSearch.trim().toLowerCase();
  const filteredFriends = normalizedFriendsSearch.length === 0
    ? friendsList.filter(f => !f.isBlocked)
    : friendsList.filter((f) => f.pseudo.toLowerCase().includes(normalizedFriendsSearch) && !f.isBlocked)
  
  //liste des bloqué
  const normalizedBanSearch = banSearch.trim().toLowerCase();
  const filteredBan = normalizedBanSearch.length === 0
    ? friendsList.filter(f => f.isBlocked)
    : friendsList.filter((f) => f.pseudo.toLowerCase().includes(normalizedBanSearch) && f.isBlocked)

    // toggle (true ou false) un amis de la liste de favoris
    function toggleToFav(friend: Friend) {
      toggleFavFriend(friend.id);
      // console.log(friendsList.filter(f => f.isFavFriend === true));//test
    }

    //enleve un amis de la liste
    function removeFromList(friend: Friend) {
      removeFriend(friend.id);
      // console.log(friendsList)//test
    }

    //bloque un user des relations
    function block(friend: Friend) {
      blockUser(friend.id);
      // console.log(friendsList.filter(f => f.isBlocked === true));//test
    }

    // débloquer un utilisateur
    function unblock(user: Friend) {
      unblockUser(user.id);
      // console.log(friendsList.filter(f => f.isBlocked === true));//test
    }

  return (
    <div className="border rounded-md bg-white text-black h-full">
      {isLoading && (<p className="text-sm text-gray-400 p-2">Récupération des amis en cours...</p>)}
      {error && (<p className="text-sm text-red-500 p-2">{error}</p>)}

      <Header title="Listes de vos relations" />

      <section className="min-h-screen grid grid-cols-3 gap-4 m-3">
        {/* colonne de gauche */}
        <section className="border border-violet-300 max-h-screen overflow-y-auto">
          <div className="sticky top-0 z-20 bg-white">
            {/* Titre */}
            <p className="p-2">Liste d'amis</p>
            {/* Barre de recherche */}
            <Search value={friendsSearch} onChange={setFriendsSearch} />
          </div>

          {/* Liste d'amis */}
          {filteredFriends.map((f) => {
            const friendStatus = statusData.find((st) => st.value === f.status);
            const friendAvatar = typeof f.avatar === 'string'
                          ? (<img src={f.avatar} alt={`${f.pseudo} avatar`} className="w-5 h-5 rounded-full object-cover"/>)
                          : (<FontAwesomeIcon icon={faCircleUser}/>)
            return (
              <div key={f.id} className="flex items-center border-b p-4">
                <div className="flex-1">
                  <div className="text-4xl text-gray-300">{friendAvatar}</div>
                  <div>
                    <p>{f.pseudo}</p>
                    <p className={`${friendStatus.style} w-fit`}>
                      {friendStatus.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleToFav(f)}>
                    <FontAwesomeIcon icon={faStar} className={`${f.isFavFriend ? 'text-yellow-600' : 'hover:text-yellow-600'}`}/>
                  </button>
                  <button onClick={() => removeFromList(f)}>
                    <FontAwesomeIcon icon={faUserMinus} className="hover:text-red-600"/>
                  </button>
                  <button onClick={() => block(f)}>
                    <FontAwesomeIcon icon={faBan} className="hover:text-red-600"/>
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Recherche d'utilisateur */}
        <section className="border border-gray-300">
          <p className="p-2 ">Ajouter de nouveaux amis</p>
          <AddFriend />
        </section>

        {/* Liste des utilisateurs bloqués */}
        <section className="border border-red-300">
          <p className="p-2 ">Liste d'utilisateur bloqués</p>
          {/* Barre de recherche */}
          <Search value={banSearch} onChange={setBanSearch} />
          {
            filteredBan.map(f => {
              const blockedAvatar = typeof f.avatar === 'string'
                          ? (<img src={f.avatar} alt={`${f.pseudo} avatar`} className="w-5 h-5 rounded-full object-cover"/>)
                          : (<FontAwesomeIcon icon={faCircleUser}/>)
              if (f.isBlocked)
                return (
                  <div key={f.id} className="flex items-center border-b p-4">
                    <div className="flex-1">
                      <div className="text-4xl text-gray-300">{blockedAvatar}</div>
                      <p>{f.pseudo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => unblock(f)} title="débloquer">
                        <FontAwesomeIcon icon={faCheck} className="hover:text-green-600"/>
                      </button>
                    </div>
                  </div>
              );
            })
          }
        </section>
      </section>
    </div>
  );
}

export default Friends;
