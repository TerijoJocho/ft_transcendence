/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Search from "./Search.tsx";
import { searchUser, addFriend } from "../api/api.ts";
import { useFriends } from "../hooks/useFriends.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faCircleUser } from "@fortawesome/free-solid-svg-icons";

export type SearchUserResult = {
  id: number;
  pseudo: string;
  avatarUrl: string | null;
};

export default function AddFriend() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { friendsList, fetchFriends } = useFriends();

  useEffect(() => {
    const timmedValue = searchValue.trim();
    setError(null);
    if (timmedValue.length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsLoading(true);
      searchUser({ username: timmedValue })
        .then((data) => {
          const res = data.filter(
            (user) => !friendsList.some((friend) => friend.id === user.id)
          );
          setResults(res);
        })
        .catch(() => setError("Impossible de trouver cet utilisateur"))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, friendsList]);

  async function handleAddFriend(userId: number) {
    await addFriend({ userId })
      .then(() => {
        setResults([]);
        setSearchValue("");
        fetchFriends();
      })
      .catch(() => setError("Une demande d'amis a déjà été envoyée à cet utilisateur"));
  }

  return (
    <div>
      <Search
        value={searchValue}
        onChange={setSearchValue}
        placeholder="Rechercher..."
        className="dark:bg-zinc-900"
      />

      {isLoading && (
        <p className="text-sm text-gray-400 dark:text-zinc-400 p-2">
          Recherche en cours...
        </p>
      )}
      {error && <p className="text-sm text-red-500 p-2">{error}</p>}

      {results.length > 0 && (
        <ul>
          {results.map((user) => {
            const friendAvatar =
              typeof user.avatarUrl === "string" ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.pseudo} avatar`}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <FontAwesomeIcon icon={faCircleUser} />
              );
            return (
              <li
                key={user.id}
                className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 p-3"
              >
                <div className="flex gap-2">
                  {friendAvatar}
                  <p className="text-sm">{user.pseudo}</p>
                </div>
                <button
                  title="Ajouter en ami"
                  onClick={() => handleAddFriend(user.id)}
                  className="text-xs bg-violet-500 dark:bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-violet-400 dark:hover:bg-yellow-500"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!isLoading && searchValue.trim().length > 0 && results.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-zinc-400 p-2">
          Aucun utilisateur trouvé
        </p>
      )}
    </div>
  );
}
