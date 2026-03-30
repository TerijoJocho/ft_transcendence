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

    const {fetchFriends} = useFriends();

    useEffect(() => {
        //on recupere la valeur de l'input
        const timmedValue = searchValue.trim();
        //s'il y avait une erreur on l'efface
        setError(null);
        // si la recherche est vide on reset et on ne fetch pas
        if (timmedValue.length === 0)
        {
            setResults([]);
            setIsLoading(false);
            return;
        }
        // on attend 300ms avant de lancer le fetch
        const timer = setTimeout(() => {
            setIsLoading(true);
            searchUser({username: timmedValue})
                .then(data => setResults(data))
                .catch(() => setError("Impossible de trouver cet utilisateur"))
                .finally(() => setIsLoading(false));
        }, 300);
        // si searchValue change avant 300ms, on annule le timer précédent
        return () => clearTimeout(timer);
    }, [searchValue]);

    async function handleAddFriend(userId: number) {
        await addFriend({ userId })
            .then(() => {
                setResults([]);
                setSearchValue("");
                fetchFriends();
            })
            .catch(() => setError("Impossible d'ajouter cet ami"));
    }

    
    return (
        <div>
            <Search
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Rechercher..."
            />

            {isLoading && (<p className="text-sm text-gray-400 p-2">Recherche en cours...</p>)}
            {error && (<p className="text-sm text-red-500 p-2">{error}</p>)}

            {/* UI a changer lors de la phase de test  */}
            {results.length > 0 && (
                <ul>
                    {results.map((user) => {
                        const friendAvatar = typeof user.avatarUrl === 'string'
                                                  ? (<img src={user.avatarUrl} alt={`${user.pseudo} avatar`} className="w-5 h-5 rounded-full object-cover"/>)
                                                  : (<FontAwesomeIcon icon={faCircleUser}/>)
                        return (
                        <li key={user.id} className="flex items-center justify-between border-b p-3">
                            <div className="flex gap-2">
                                {friendAvatar}
                                <p className="text-sm">{user.pseudo}</p>
                            </div>
                            <button
                                title="Ajouter en ami"
                                onClick={() => handleAddFriend(user.id)}
                                className="text-xs bg-violet-500 text-white px-3 py-1 rounded-md hover:bg-violet-400"
                            >
                                <FontAwesomeIcon icon={faUserPlus} />
                            </button>
                        </li>
                        )
                    })}
                </ul>
            )}

            {!isLoading && searchValue.trim().length > 0 && results.length === 0 && (
                <p className="text-sm text-gray-400 p-2">Aucun utilisateur trouvé</p>
            )}
        </div>
    );
}