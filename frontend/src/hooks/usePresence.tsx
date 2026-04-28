import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getFriendsList } from "../api/api";
import { useRealtimeSocket } from "./useRealtimeSocket";

export type FriendPresence = {
  id: number;
  pseudo: string;
  status: string;
  online: boolean;
  avatarUrl: string | null;
  friendshipStatus: string;
  level: number;
  lose: number;
};

type PresenceContextType = {
  friendsList: FriendPresence[];
  isFriendsLoading: boolean;
  friendsError: string | null;
  refreshFriends: (silent?: boolean) => Promise<void>;
};

const PresenceContext = createContext<PresenceContextType | null>(null);

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { socket } = useRealtimeSocket();
  const [friendsList, setFriendsList] = useState<FriendPresence[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState<boolean>(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);

  const refreshFriends = useCallback(async (silent = false) => {
    if (!silent) {
      setIsFriendsLoading(true);
      setFriendsError(null);
    }

    try {
      const data = await getFriendsList();
      const normalized: FriendPresence[] = (data ?? [])
        .map((f) => ({
          id: f.id,
          pseudo: f.pseudo,
          status: f.status,
          online: f.online,
          avatarUrl: typeof f.avatarUrl === "string" ? f.avatarUrl : null,
          friendshipStatus: f.friendshipStatus,
          level: f.level ?? 0,
          lose: f.lose ?? 0,
        }));

      setFriendsList(normalized);
      if (!silent) setFriendsError(null);
    } catch {
      if (!silent) {
        setFriendsError("Impossible de charger la liste d'amis");
      }
    } finally {
      if (!silent) setIsFriendsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFriends(false);
  }, [refreshFriends]);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "presence_update",
      (payload: { userId?: number; online?: boolean; status?: string }) => {
        if (!payload?.userId || typeof payload.online !== "boolean") return;

        setFriendsList((prev) =>
          prev.map((friend) =>
            friend.id === payload.userId
              ? {
                  ...friend,
                  online: payload.online,
                  status: payload.online ? "ONLINE" : "OFFLINE",
                }
              : friend,
          ),
        );
      },
    );

    return () => {
      socket.off("presence_update");
    };
  }, [socket]);

  return (
    <PresenceContext.Provider
      value={{
        friendsList,
        isFriendsLoading,
        friendsError,
        refreshFriends,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
}
