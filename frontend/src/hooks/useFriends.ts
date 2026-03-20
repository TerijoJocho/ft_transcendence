import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import * as api from "../api/api.ts";

export type Friends = {
    id: number;
  pseudo: string;
  status: string;
  avatar: string | typeof faCircleUser;
  relationship: string;
};

export function useFriends() {
    const [friendsList, setFriendsList] = useState<Friends[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    //on lance une getFriends apres que le render soit fait
    useEffect(() => {
        api.getFriendsList()
            .then(data => setFriendsList(data))
            .catch(() => setError(`Impossible de charger la liste d'amis`))
            .finally(() => setLoading(false))
    }, []);

    //fonction pour rajouter un amis 
    const addFriend = async (data: {userId: number}) => {
        api.addFriend(data)
            .then(newFriend => setFriendsList(prev => [...prev, newFriend]))
            .catch(() => setError(`Impossible d'ajouter ce nouvel ami`))
            .finally(() => setLoading(false))
    }

    //fonction pour enlever un amis
    const removeFriend = async (data: {userId: number}) => {
        api.removeFriend(data)
            .then(() => setFriendsList(prev => prev.filter(f => f.id !== data.userId)))
            .catch(() => setError(`Impossible d'enlever cet ami`))
            .finally(() => setLoading(false))
    }

    return {friendsList, isLoading, error, addFriend, removeFriend};
}