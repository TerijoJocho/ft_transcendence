import Header from "../components/Header.tsx";
import { useFriends, type Friends as Friend } from "../hooks/useFriends.ts";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMinus,
  faCircleUser,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Search from "../components/Search.tsx";
import AddFriend from "../components/AddFriends.tsx";
import statusData from "../data/statusData.ts";

function Friends() {
  const {
    friendsList,
    isLoading,
    error,
    removeFriend,
    changeFriendshipStatus,
  } = useFriends();
  const [friendsSearch, setFriendsSearch] = useState<string>("");

  //liste des amis 'ADDED'
  const normalizedFriendsSearch = friendsSearch.trim().toLowerCase();
  const filteredFriends =
    normalizedFriendsSearch.length === 0
      ? friendsList.filter((f) => f.friendshipStatus === "ADDED")
      : friendsList.filter(
          (f) =>
            f.pseudo.toLowerCase().includes(normalizedFriendsSearch) &&
            f.friendshipStatus === "ADDED",
        );
  //list des amis 'PENDING'
  const filteredPendingList = friendsList.filter(
    (f) => f.friendshipStatus === "PENDING",
  );

  //enleve un amis de la liste
  function removeFromList(friend: Friend) {
    removeFriend(friend.id);
    // console.log(filteredFriends)//test
  }

  // enleve du pending un utilisateur
  function addToFriendList(user: Friend) {
    changeFriendshipStatus(user.id);
    // console.log(friendsList.filter(f => f.isBlocked === true));//test
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 h-full transition-colors duration-300">
      <Header title="Listes de vos relations" />

      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-4 m-3">
        {/* colonne de gauche */}
        <section className="border border-violet-300 dark:border-yellow-700 h-auto lg:max-h-screen overflow-y-auto">
          <div className="sticky top-0 z-20 bg-white dark:bg-zinc-900">
            {/* Titre */}
            <p className="p-2">Liste d'amis</p>
            {/* Barre de recherche */}
            <Search value={friendsSearch} onChange={setFriendsSearch} />
          </div>

          {isLoading && (
            <p className="text-sm text-gray-400 dark:text-zinc-400 p-2">
              Récupération des amis en cours...
            </p>
          )}
          {error && <p className="text-sm text-red-500 p-2">{error}</p>}

          {/* Liste d'amis */}
          {filteredFriends.map((f) => {
            const friendStatus = statusData.find((st) => st.value === f.status);
            const friendAvatar =
              typeof f.avatarUrl === "string" ? (
                <img
                  src={f.avatarUrl}
                  alt={`${f.pseudo} avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <FontAwesomeIcon icon={faCircleUser} />
              );
            return (
              <div
                key={f.id}
                className="flex items-center border-b border-gray-200 dark:border-zinc-600 p-4"
              >
                <div className="flex-1">
                  <div>{friendAvatar}</div>
                  <div>
                    <p>{f.pseudo}</p>
                    <p
                      className={`${friendStatus.style} w-fit border-none mt-1`}
                    >
                      {friendStatus.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromList(f)}>
                    <FontAwesomeIcon
                      icon={faUserMinus}
                      className="hover:text-red-600"
                    />
                  </button>
                </div>
              </div>
            );
          })}
          {!isLoading && filteredFriends.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-400 p-2">
              Aucun amis pour l'instant
            </p>
          )}
        </section>

        {/* Recherche d'utilisateur */}
        <section className="border border-gray-300 dark:border-zinc-600 h-auto lg:max-h-screen overflow-y-auto">
          <p className="p-2 dark:bg-zinc-900">Ajouter de nouveaux amis</p>
          <AddFriend />
        </section>

        {/* Liste des utilisateurs en pending */}
        <section className="border border-red-300 dark:border-red-800 h-auto lg:max-h-screen overflow-y-auto">
          <p className="p-2 ">Liste de demande d'amis</p>
          {filteredPendingList.map((f) => {
            const pendingAvatar =
              typeof f.avatarUrl === "string" ? (
                <img
                  src={f.avatarUrl}
                  alt={`${f.pseudo} avatar`}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <FontAwesomeIcon icon={faCircleUser} />
              );
            return (
              <div
                key={f.id}
                className="flex items-center border-b border-zinc-200 dark:border-zinc-600 p-4"
              >
                <div className="flex-1">
                  <div className="text-4xl text-gray-300 dark:text-zinc-500">
                    {pendingAvatar}
                  </div>
                  <p>{f.pseudo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => addToFriendList(f)} title="débloquer">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="hover:text-green-600"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </section>
    </div>
  );
}

export default Friends;
