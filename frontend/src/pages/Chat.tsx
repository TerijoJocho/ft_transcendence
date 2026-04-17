import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header.tsx";
import { connectChatSocket, getFriendsList } from "../api/api.ts";
import type { Socket } from "socket.io-client";

type ChatMessage = {
  from: number;
  to: number;
  content: string;
  ts: string;
};

type Friend = {
  id: number;
  pseudo: string;
  avatarUrl: string | null | { iconName?: string };
};

function Chat() {
  const socketRef = useRef<Socket | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [peerId, setPeerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chatSocket = connectChatSocket();
    socketRef.current = chatSocket;

    chatSocket.on("chat_history", (history: ChatMessage[]) => {
      setMessages(history ?? []);
    });

    chatSocket.on("recv_dm", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    chatSocket.on("chat_error", (payload: { message?: string }) => {
      setError(payload?.message ?? "Chat error");
    });

    return () => {
      chatSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    getFriendsList()
      .then((list) => {
        const mapped = (list ?? []).map((item) => ({
          id: item.id,
          pseudo: item.pseudo,
          avatarUrl: item.avatarUrl ?? null,
        }));
        setFriends(mapped);
        if (mapped.length > 0) setPeerId((prev) => prev ?? mapped[0].id);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Unable to load friends list.";
        setError(msg);
      });
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !peerId) return;
    socket.emit("join_dm", { peerId });
  }, [peerId]);

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === peerId) ?? null,
    [friends, peerId],
  );

  function sendMessage() {
    const socket = socketRef.current;
    if (!socket || !peerId) return;
    const content = text.trim();
    if (!content) return;
    socket.emit("send_dm", { peerId, content });
    setText("");
  }

  const canSend = Boolean(peerId && text.trim().length > 0);

  return (
    <div className="text-black border min-w-max bg-[#f6f7f9]">
      <Header title="Messages privés" />
      <div className="p-6 grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
        <aside className="col-span-4 bg-white rounded-lg border border-gray-200 p-3 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Amis</p>
          <div className="flex flex-col gap-2">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => {
                  setPeerId(friend.id);
                  setMessages([]);
                  setError(null);
                }}
                className={`flex items-center gap-3 p-2 rounded-md border text-left transition ${
                  peerId === friend.id
                    ? "border-black bg-gray-50"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                {typeof friend.avatarUrl === "string" && friend.avatarUrl.length > 0 ? (
                  <img src={friend.avatarUrl} alt={friend.pseudo} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                )}
                <span className="text-sm text-gray-900">{friend.pseudo}</span>
              </button>
            ))}
            {friends.length === 0 && (
              <p className="text-sm text-gray-500 px-2 py-1">Aucun ami disponible.</p>
            )}
          </div>
        </aside>

        <section className="col-span-8 bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
          <div className="pb-3 border-b border-gray-200 mb-3">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              {selectedFriend ? `Conversation · ${selectedFriend.pseudo}` : "Aucune conversation"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {messages.map((message, idx) => (
              <div key={`${message.ts}-${idx}`} className="bg-gray-50 rounded-md border border-gray-200 px-3 py-2">
                <p className="text-xs text-gray-500">{new Date(message.ts).toLocaleTimeString()}</p>
                <p className="text-sm text-gray-900">{message.content}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-gray-500">Aucun message pour le moment.</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600 py-2">{error}</p>}

          <div className="mt-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Écris un message..."
              className="flex-1 rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900"
            />
            <button
              onClick={sendMessage}
              disabled={!canSend}
              className={`px-4 rounded-md transition ${canSend ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
            >
              Envoyer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Chat;