import { useState, useEffect } from "react";
import Search from "./Search.tsx";
import { searchUser, addFriend } from "../api/api.ts";
import type { Friends } from "../hooks/useFriends.ts";

export default function AddFriend() {
    const [searchValue, setSearchValue] = useState<string>("");
    const [results, setResults] = useState<Friends[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // si la recherche est vide on reset et on ne fetch pas
        if (searchValue.trim().length === 0) {
            return;
        }
        // on attend 300ms avant de lancer le fetch
        const timer = setTimeout(() => {
            setIsLoading(true);
            searchUser({username: searchValue.trim()})
                .then(setResults)
                .catch(() => setError("Impossible de rechercher cet utilisateur"))
                .finally(() => setIsLoading(false));
        }, 300);
        // si searchValue change avant 300ms, on annule le timer précédent
        return () => clearTimeout(timer);
    }, [searchValue]);

    async function handleAddFriend(userId: number) {
        await addFriend({ userId })
            .catch(() => setError("Impossible d'ajouter cet ami"));
        setResults([]);
        setSearchValue("");
    }

    return (
        <div>
            <Search
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Rechercher..."
            />

            {isLoading && (
                <p className="text-sm text-gray-400 p-2">Recherche en cours...</p>
            )}

            {error && (
                <p className="text-sm text-red-500 p-2">{error}</p>
            )}

            {/* UI a changer lors de la phase de test  */}
            {results.length > 0 && (
                <ul>
                    {results.map((user) => (
                        <li key={user.id} className="flex items-center justify-between border-b p-3">
                            <p className="text-sm">{user.pseudo}</p>
                            <button
                                title="Ajouter en ami"
                                onClick={() => handleAddFriend(user.id)}
                                className="text-xs bg-violet-500 text-white px-3 py-1 rounded-md hover:bg-violet-400"
                            >
                                Ajouter
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading && searchValue.trim().length > 0 && results.length === 0 && (
                <p className="text-sm text-gray-400 p-2">Aucun utilisateur trouvé</p>
            )}
        </div>
    );
}