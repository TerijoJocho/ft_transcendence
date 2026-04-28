import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/useAuth";
import type { Socket } from "socket.io-client";
import { connectRealtimeSocket } from "../api/api";

type RealtimeSocketContextType = {
  socket: Socket | null;
};

const RealtimeSocketContext =
  createContext<RealtimeSocketContextType | null>(null);


export function RealtimeSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocket(null);
      return;
    }
    const realtimeSocket = connectRealtimeSocket();
    setSocket(realtimeSocket);

    return () => {
      if (realtimeSocket.connected)
        realtimeSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  const value = useMemo(() => ({ socket }), [socket]);

  return (
    <RealtimeSocketContext.Provider value={value}>
      {children}
    </RealtimeSocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRealtimeSocket() {
  const context = useContext(RealtimeSocketContext);
  if (!context) {
    throw new Error(
      "useRealtimeSocket must be used within a RealtimeSocketProvider",
    );
  }
  return context;
}