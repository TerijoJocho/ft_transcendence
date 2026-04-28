import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import * as api from "../api/api.ts";
import { usePresence } from "./usePresence.tsx";

export type Friends = {
    id: number;
    pseudo: string;
    status: string;
    online: boolean;
    avatarUrl: string | IconDefinition;
    friendshipStatus: string;
    level: number;
    lose: number;
};

export function useFriends() {
    const {
        friendsList,
        isFriendsLoading,
        friendsError,
        refreshFriends,
    } = usePresence();

    const fetchFriends = async () => {
        await refreshFriends(false);
    };

    const removeFriend = async (userId: number) => {
        await api.removeFriend({ userId })
            .catch(() => undefined);
        await fetchFriends();
    };

    const changeFriendshipStatus = async (userId: number) => {
        await api.changeFriendshipStatus({ userId })
            .catch(() => undefined);
        await fetchFriends();
    };

    return {
        friendsList: friendsList as Friends[],
        isLoading: isFriendsLoading,
        error: friendsError,
        removeFriend,
        changeFriendshipStatus,
        fetchFriends,
    };
}