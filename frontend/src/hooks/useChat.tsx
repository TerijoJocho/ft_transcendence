import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { connectChatSocket, refreshSession } from "../api/api";
import type { Socket } from "socket.io-client";

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

export function ChatProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
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
    const chatSocket = connectChatSocket();
    socketRef.current = chatSocket;

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
        if (!chatSocket.connected) {
          chatSocket.connect();
        }
      } catch {
        setError("Session expirée. Reconnecte-toi.");
      } finally {
        isRefreshingSessionRef.current = false;
      }
    };

    chatSocket.on("chat_history", (history: ChatMessage[]) => {
      const peerId = activePeerRef.current;
      if (peerId === null) return;
      setMessages((prev) => ({ ...prev, [peerId]: history ?? [] }));
    });

    chatSocket.on("recv_dm", (message: ChatMessage) => {
      // Pour les messages entrants, from n'est généralement jamais "me"
      const peerId =
        typeof message.from === "number" ? message.from : activePeerRef.current;
      if (peerId === null) return;

      setMessages((prev) => ({
        ...prev,
        [peerId]: [...(prev[peerId] ?? []), message],
      }));
    });

    chatSocket.on("chat_error", (payload: { message?: string }) => {
      if (isUnauthorizedMessage(payload?.message)) {
        void tryRefreshAndReconnect();
        return;
      }
      setError(payload?.message ?? "Chat error");
    });

    chatSocket.on("connect_error", (error: Error) => {
      if (isUnauthorizedMessage(error.message)) {
        void tryRefreshAndReconnect();
        return;
      }
      setError(error.message || "Erreur de connexion au chat");
    });

    chatSocket.on("disconnect", (reason) => {
      // Server-side disconnect usually happens after auth failure.
      if (reason === "io server disconnect") {
        void tryRefreshAndReconnect();
      }
    });

    return () => {
      chatSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = React.useCallback((peerId: number, content: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("send_dm", { peerId, content });

    const optimistic: ChatMessage = {
      from: "me",
      to: peerId,
      content,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [peerId]: [...(prev[peerId] ?? []), optimistic],
    }));
  }, []);

  const joinRoom = React.useCallback((peerId: number) => {
    activePeerRef.current = peerId;
    if (socketRef.current) {
      socketRef.current.emit("join_dm", { peerId });
    }
  }, []);

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
