import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { refreshSession } from "../api/api";
import { useRealtimeSocket } from "./useRealtimeSocket";

export type ChatMessage = {
  id?: number;
  from: number | "me";
  to?: number;
  content: string;
  ts: string;
};

type ChatContextType = {
  messages: Record<number, ChatMessage[]>;
  sendMessage: (peerId: number, content: string) => void;
  joinRoom: (peerId: number) => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

const ChatContext = createContext<ChatContextType | null>(null);

function toEpochMs(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function messageKey(message: ChatMessage) {
  return `${String(message.from)}|${String(message.to ?? "")}|${message.content}|${message.ts}`;
}

function mergeMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[],
) {
  const combined = [...existing, ...incoming].sort(
    (a, b) => toEpochMs(a.ts) - toEpochMs(b.ts),
  );

  // Keep only exact message copies once history and live events are combined.
  const exactUnique: ChatMessage[] = [];
  const seen = new Set<string>();

  for (const message of combined) {
    const key = messageKey(message);
    if (seen.has(key)) continue;
    seen.add(key);
    exactUnique.push(message);
  }

  return exactUnique;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { socket } = useRealtimeSocket();
  const activePeerRef = useRef<number | null>(null);
  const isRefreshingSessionRef = useRef(false);

  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>(
    () => {
      const saved = localStorage.getItem("chat_messages");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erreur de message: ", e);
          return {};
        }
      }
      return {};
    },
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const isUnauthorizedMessage = (message: string | undefined) => {
      if (!message) return false;
      return /unauthorized|jwt|token|expired/i.test(message);
    };

    const tryRefreshAndReconnect = async () => {
      if (isRefreshingSessionRef.current) return;
      isRefreshingSessionRef.current = true;

      try {
        await refreshSession();
        setError(null);
        if (!socket.connected) {
          socket.connect();
        }
      } catch {
        setError("Session expirée. Reconnecte-toi.");
      } finally {
        isRefreshingSessionRef.current = false;
      }
    };

    socket.on("chat_history", (history: ChatMessage[]) => {
      const peerId = activePeerRef.current;
      if (peerId === null) return;
      setMessages((prev) => ({
        ...prev,
        [peerId]: mergeMessages(prev[peerId] ?? [], history ?? []),
      }));
    });

    socket.on("recv_dm", (message: ChatMessage) => {
      const activePeerId = activePeerRef.current;
      const peerId =
        activePeerId !== null && message.to === activePeerId
          ? activePeerId
          : activePeerId !== null && message.from === activePeerId
            ? activePeerId
            : typeof message.from === "number"
              ? message.from
              : typeof message.to === "number"
                ? message.to
                : activePeerId;
      if (peerId === null) return;

      setMessages((prev) => ({
        ...prev,
        [peerId]: mergeMessages(prev[peerId] ?? [], [message]),
      }));
    });

    socket.on("chat_error", (payload: { message?: string }) => {
      if (isUnauthorizedMessage(payload?.message)) {
        void tryRefreshAndReconnect();
        return;
      }
      setError(payload?.message ?? "Chat error");
    });

    socket.on("connect_error", (error: Error) => {
      if (isUnauthorizedMessage(error.message)) {
        void tryRefreshAndReconnect();
        return;
      }
      setError(error.message || "Erreur de connexion au chat");
    });

    socket.on("disconnect", (reason) => {
      // Server-side disconnect usually happens after auth failure.
      if (reason === "io server disconnect") {
        void tryRefreshAndReconnect();
      }
    });

    return () => {
      socket.off("chat_history");
      socket.off("recv_dm");
      socket.off("chat_error");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [socket]);

  const sendMessage = React.useCallback((peerId: number, content: string) => {
    if (!socket) return;
    socket.emit("send_dm", { peerId, content });
  }, [socket]);

  const joinRoom = React.useCallback((peerId: number) => {
    activePeerRef.current = peerId;
    if (socket) {
      socket.emit("join_dm", { peerId });
    }
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        joinRoom,
        error,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
