import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header.tsx";
import { connectChatSocket, getFriendsList } from "../api/api.ts";
import type { Socket } from "socket.io-client";
import statusData from "../data/statusData.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faCircle } from "@fortawesome/free-solid-svg-icons";
import Level from "../components/Level.tsx";
import Search from "../components/Search.tsx";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id?: number;
  from: number | "me";
  to?: number;
  content: string;
  ts: string;
};

type ChatFriend = {
  id: number;
  pseudo: string;
  avatarUrl: string | null;
  status?: string | null;
  level?: number;
};

// ─── Composant ────────────────────────────────────────────────────────────────

function Chat() {
  const socketRef = useRef<Socket | null>(null);

  const [friends, setFriends] = useState<ChatFriend[]>([]);
  const [peerId, setPeerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── WebSocket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    const chatSocket = connectChatSocket();
    socketRef.current = chatSocket;

    chatSocket.on("chat_history", (history: ChatMessage[]) => {
      if (peerId === null) return;
      setMessages((prev) => ({ ...prev, [peerId]: history ?? [] }));
    });

    chatSocket.on("recv_dm", (message: ChatMessage) => {
      const senderId = typeof message.from === "number" ? message.from : peerId;
      if (senderId === null) return;
      setMessages((prev) => ({
        ...prev,
        [senderId]: [...(prev[senderId] ?? []), message],
      }));
    });

    chatSocket.on("chat_error", (payload: { message?: string }) => {
      setError(payload?.message ?? "Chat error");
    });

    return () => {
      chatSocket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chargement de la liste d'amis ──────────────────────────────────────────
  useEffect(() => {
    getFriendsList()
      .then((list) => {
        const mapped: ChatFriend[] = (list ?? [])
          .filter((f) => f.friendshipStatus === "ADDED")
          .map((f) => ({
            id: f.id,
            pseudo: f.pseudo,
            avatarUrl: typeof f.avatarUrl === "string" ? f.avatarUrl : null,
            status: f.status ?? null,
            level: f.level ?? 0,
          }));
        setFriends(mapped);
        if (mapped.length > 0) setPeerId((prev) => prev ?? mapped[0].id);
      })
      .catch((e) => {
        const msg =
          e instanceof Error
            ? e.message
            : "Impossible de charger la liste d'amis";
        setError(msg);
      });
  }, []);

  // ── Join room quand on change de conversation ──────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || peerId === null) return;
    socket.emit("join_dm", { peerId });
  }, [peerId]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const selectedFriend = useMemo(
    () => friends.find((f) => f.id === peerId) ?? null,
    [friends, peerId],
  );

  const selectedFriendStatus = statusData.find(
    (st) => st.value === selectedFriend?.status,
  );

  const filteredFriends = friends.filter((f) =>
    f.pseudo.toLowerCase().includes(search.toLowerCase()),
  );

  const currentMessages = peerId !== null ? (messages[peerId] ?? []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  function sendMessage() {
    const socket = socketRef.current;
    if (!socket || peerId === null) return;
    const content = text.trim();
    if (!content) return;

    socket.emit("send_dm", { peerId, content });

    // Optimistic update
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

    setText("");
  }

  const canSend = Boolean(peerId !== null && text.trim().length > 0);

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="border rounded-md bg-white text-black h-full flex flex-col">
      <Header title="Messages privés" />

      <div className="flex border-t flex-1 overflow-hidden">
        {/* ── Colonne gauche : liste des conversations ── */}
        <section className="w-64 max-h-screen flex flex-col border-r shrink-0">
          {/* Barre de recherche */}
          <Search value={search} onChange={setSearch} />

          {/* Liste des conversations */}
          <div className="overflow-y-auto flex-1">
            {filteredFriends.map((friend) => {
              const isSelected = selectedFriend?.id === friend.id;
              const msgs = messages[friend.id];
              const preview =
                msgs && msgs.length > 0
                  ? msgs[msgs.length - 1].content
                  : "Démarrer une conversation";
              const friendStatus = statusData.find(
                (st) => st.value === friend.status,
              );

              return (
                <button
                  key={friend.id}
                  onClick={() => {
                    setPeerId(friend.id);
                    setError(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-violet-50 transition-colors text-left
                                        ${isSelected ? "bg-violet-200" : ""}`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.pseudo}
                        className="w-8 h-8 rounded-full object-cover bg-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300" />
                    )}
                    <FontAwesomeIcon
                      icon={faCircle}
                      className={`absolute bottom-0 right-0 text-xs text-${friendStatus?.color ?? "gray-400"}`}
                    />
                  </div>

                  {/* Pseudo + aperçu */}
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${isSelected ? "text-violet-700" : "text-gray-800"}`}
                    >
                      {friend.pseudo}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{preview}</p>
                  </div>
                </button>
              );
            })}

            {filteredFriends.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-8">
                Aucun ami trouvé
              </p>
            )}
          </div>
        </section>

        {/* ── Colonne centrale : zone de messages ── */}
        <section className="flex-1 flex flex-col border-r overflow-hidden h-screen">
          {selectedFriend ? (
            <>
              {/* Header de la conv */}
              <div className="flex items-center gap-3 px-5 py-3 border-b bg-gray-50 shrink-0">
                {selectedFriend.avatarUrl ? (
                  <img
                    src={selectedFriend.avatarUrl}
                    alt={selectedFriend.pseudo}
                    className="w-8 h-8 rounded-full object-cover bg-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">
                    {selectedFriend.pseudo}
                  </p>
                  <p
                    className={`text-xs text-${selectedFriendStatus?.color} flex items-center gap-1`}
                  >
                    <FontAwesomeIcon icon={faCircle} className="text-[8px]" />
                    {selectedFriendStatus?.label ?? "Status inconnu"}
                  </p>
                </div>
              </div>

              {/* Bulles de messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {currentMessages.map((msg, idx) => {
                  const isMe = msg.from === "me" || msg.from !== peerId;
                  return (
                    <div
                      key={`${msg.ts}-${idx}`}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl text-sm break-all
                                    ${
                                      isMe
                                        ? "bg-violet-600 text-white rounded-br-sm"
                                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                    }`}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 text-right
                                      ${isMe ? "text-violet-200" : "text-gray-400"}`}
                        >
                          {new Date(msg.ts).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {currentMessages.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mt-16">
                    Aucun message pour l'instant.
                    <br />
                    Dis bonjour à {selectedFriend.pseudo} !
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <p className="text-center text-sm text-red-500 px-4 pb-2">
                  {error}
                </p>
              )}

              {/* Zone de saisie */}
              <div className="px-4 py-3 border-t bg-gray-50 flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Message à ${selectedFriend.pseudo}...`}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!canSend}
                  className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Sélectionne une conversation
            </div>
          )}
        </section>

        {/* ── Colonne droite : mini profil de l'ami ── */}
        <section className="w-56 shrink-0 flex flex-col items-center p-6 gap-4 bg-gray-50">
          {selectedFriend ? (
            <>
              <div className="flex flex-col items-center gap-2 mt-4">
                {selectedFriend.avatarUrl ? (
                  <img
                    src={selectedFriend.avatarUrl}
                    alt={selectedFriend.pseudo}
                    className="w-20 h-20 rounded-full object-cover bg-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300" />
                )}
                <p className="font-semibold text-gray-800 text-lg">
                  {selectedFriend.pseudo}
                </p>
                <span className={`${selectedFriendStatus?.style} border-none`}>
                  {selectedFriendStatus?.label}
                </span>
              </div>

              <hr className="w-full border-gray-200" />

              <div className="w-full space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Victoires</span>
                  <span className="font-semibold text-gray-800">
                    {selectedFriend.level ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Défaites</span>
                  <span className="font-semibold text-gray-800">
                    {selectedFriend.lose ?? 0}
                  </span>
                </div>
              </div>

              <hr className="w-full border-gray-200" />

              <div className="w-full flex flex-col gap-2">
                <Level level={selectedFriend.level ?? 0} />
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm mt-8 text-center">
              Sélectionne un ami pour voir son profil
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Chat;
