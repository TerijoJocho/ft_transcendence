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
    friendshipStatus: string;
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

    const removeFriend = async (userId: number) => {
        await api.removeFriend({ userId })
            .catch(() => setError(`Impossible d'enlever cet ami`));
        fetchFriends();
    };

    const changeFriendshipStatus = async (userId: number) => {
        await api.changeFriendshipStatus({ userId })
            .catch(() => setError(`Impossible d'accepter la demande de cet utilisateur`));
        fetchFriends();
    };

    return { friendsList, isLoading, error, removeFriend, changeFriendshipStatus };
}