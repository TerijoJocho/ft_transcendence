/* eslint-disable react-hooks/set-state-in-effect */
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useCallback } from "react";
import * as api from "../api/api.ts";

//test
import {friendsData} from '../data/sideBarData.ts';
const USE_MOCK = true;

export type Friends = {
    id: number;
    pseudo: string;
    status: string;
    avatar: string | IconDefinition;
    isFriend: boolean;
    isBlocked: boolean;
    isFavFriend: boolean;
};

export function useFriends() {
    const [friendsList, setFriendsList] = useState<Friends[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // fetch initial au mount
    useEffect(() => {
        if (USE_MOCK) {
            setError(null);
            setFriendsList(friendsData);
            setLoading(false);
            return;
        }
        setLoading(true);
        api.getFriendsList()
            .then(data => setFriendsList(data))
            .catch(() => setError(`Impossible de charger la liste d'amis`))
            .finally(() => setLoading(false));
    }, []);

    // refetch après que l'user clique sur les buttons
    const fetchFriends = useCallback(() => {
        if (USE_MOCK)
            return;
        setLoading(true);
        api.getFriendsList()
            .then(data => setFriendsList(data))
            .catch(() => setError(`Impossible de charger la liste d'amis`))
            .finally(() => setLoading(false));
    }, []);

    const toggleFavFriend = async (userId: number) => {
        await api.toggleFavFriend({ userId })
            .catch(() => setError(`Impossible de modifier les favoris`));
        fetchFriends();
    };

    const removeFriend = async (userId: number) => {
        await api.removeFriend({ userId })
            .catch(() => setError(`Impossible d'enlever cet ami`));
        fetchFriends();
    };

    const blockUser = async (userId: number) => {
        await api.blockUser({ userId })
            .catch(() => setError(`Impossible de bloquer cet utilisateur`));
        fetchFriends();
    };

    const unblockUser = async (userId: number) => {
        await api.unblockUser({ userId })
            .catch(() => setError(`Impossible de débloquer cet utilisateur`));
        fetchFriends();
    };

    return { friendsList, isLoading, error, toggleFavFriend, removeFriend, blockUser, unblockUser };
}