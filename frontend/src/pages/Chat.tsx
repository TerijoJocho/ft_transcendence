import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header.tsx";
import statusData from "../data/statusData.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faCircle } from "@fortawesome/free-solid-svg-icons";
import Level from "../components/Level.tsx";
import Search from "../components/Search.tsx";
import { useChat } from "../hooks/useChat.tsx";
import { usePresence } from "../hooks/usePresence.tsx";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatFriend = {
  id: number;
  pseudo: string;
  avatarUrl: string | null;
  status: string;
  online?: boolean;
  level?: number;
  lose?: number;
};

type MobileView = "list" | "chat" | "profile";

// ─── Composant ────────────────────────────────────────────────────────────────

function Chat() {
  const { friendsList, isFriendsLoading, friendsError } = usePresence();
  const {
    messages,
    sendMessage,
    joinRoom,
    error,
    setError,
  } = useChat();

  // Etat principal de la page (sélection, affichage mobile, saisie et filtre)
  const [peerId, setPeerId] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Removed WebSocket setup since it is handled by ChatProvider

  const friends = useMemo(
    () =>
      (friendsList as ChatFriend[]).map((f) => ({
        ...f,
        avatarUrl: typeof f.avatarUrl === "string" ? f.avatarUrl : null,
      })),
    [friendsList],
  );

  useEffect(() => {
    setPeerId((prev) => {
      if (friends.length === 0) return null;
      if (prev !== null && friends.some((f) => f.id === prev)) return prev;
      return friends[0].id;
    });
  }, [friends]);

  // ── Join room quand on change de conversation ──────────────────────────────
  useEffect(() => {
    if (peerId === null) return;
    joinRoom(peerId);
  }, [peerId, joinRoom]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const selectedFriend = useMemo(
    () => friends.find((f) => f.id === peerId) ?? null,
    [friends, peerId],
  );

  const selectedFriendPresence =
    selectedFriend?.online === true
      ? "ONLINE"
      : selectedFriend?.online === false
        ? "OFFLINE"
        : selectedFriend?.status;

  const selectedFriendStatus = statusData.find(
    (st) => st.value === selectedFriendPresence,
  );

  const filteredFriends = useMemo(
    () =>
      friends.filter((f) =>
        f.pseudo.toLowerCase().includes(search.toLowerCase()),
      ),
    [friends, search],
  );

  const currentMessages = useMemo(
    () => (peerId !== null ? (messages[peerId] ?? []) : []),
    [peerId, messages],
  );

  // Scroll automatique en bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Envoi d'un message texte dans la conversation active
  function handleSendMessage() {
    if (peerId === null) return;
    const content = text.trim();
    if (!content) return;

    sendMessage(peerId, content);
    setText("");
  }

  // Ouvre une conversation
  function openConversation(friendId: number) {
    setPeerId(friendId);
    setMobileView("chat");
    setError(null);
  }

  // Passe de la vue chat à la vue profil sur mobile
  function openMobileProfile() {
    setMobileView("profile");
  }

  // Revient de la vue profil à la vue chat sur mobile
  function closeMobileProfile() {
    setMobileView("chat");
  }

  const canSend = Boolean(peerId !== null && text.trim().length > 0);

  return (
    <div className="border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-3rem)] w-full min-w-0 flex flex-col overflow-hidden transition-colors duration-300">
      <Header title="Messages privés" />

      <div className="flex-1 min-h-0 overflow-hidden border-t border-gray-200 dark:border-zinc-700">
        {/* Layout mobile: une seule vue visible à la fois (liste, chat ou profil) */}
        <div className="flex h-full min-h-0 md:hidden">
          {mobileView === "list" && (
            <section className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <Search
                value={search}
                onChange={setSearch}
                className="dark:bg-zinc-900"
              />

              <div className="flex-1 min-h-0 overflow-y-auto">
                {isFriendsLoading && (
                  <p className="text-center text-gray-400 dark:text-zinc-400 text-sm mt-8">
                    Chargement des amis...
                  </p>
                )}

                {friendsError && (
                  <p className="text-center text-red-500 text-sm mt-4 px-4">
                    {friendsError}
                  </p>
                )}

                {filteredFriends.map((friend) => {
                  const isSelected = selectedFriend?.id === friend.id;
                  const msgs = messages[friend.id];
                  const preview =
                    msgs && msgs.length > 0
                      ? msgs[msgs.length - 1].content
                      : "Démarrer une conversation";
                  const presence =
                    friend.online === true
                      ? "ONLINE"
                      : friend.online === false
                        ? "OFFLINE"
                        : friend.status;
                  const friendStatus = statusData.find(
                    (st) => st.value === presence,
                  );

                  return (
                    // Ligne de conversation: avatar, pseudo, statut et aperçu du dernier message
                    <button
                      key={friend.id}
                      onClick={() => openConversation(friend.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-zinc-600 hover:bg-violet-50 dark:hover:bg-yellow-900 transition-colors text-left ${isSelected ? "bg-violet-200 dark:bg-yellow-900/40" : ""}`}
                    >
                      <div className="relative shrink-0">
                        {friend.avatarUrl ? (
                          <img
                            src={friend.avatarUrl}
                            alt={friend.pseudo}
                            className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-zinc-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-700" />
                        )}
                        <FontAwesomeIcon
                          icon={faCircle}
                          className={`absolute bottom-0 right-0 text-xs text-${friendStatus?.color ?? "gray-400"}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${isSelected ? "text-violet-700 dark:text-yellow-300" : "text-gray-800 dark:text-zinc-100"}`}
                        >
                          {friend.pseudo}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-400 truncate">
                          {preview}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {filteredFriends.length === 0 && (
                  <p className="text-center text-gray-400 dark:text-zinc-400 text-sm mt-8">
                    Aucun ami trouvé
                  </p>
                )}
              </div>
            </section>
          )}

          {mobileView === "chat" && (
            <section className="flex flex-1 min-h-0 flex-col overflow-hidden">
              {selectedFriend ? (
                <>
                  {/* En-tête de conversation mobile (navigation + identité du contact) */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 shrink-0">
                    <button
                      onClick={() => setMobileView("list")}
                      className="border border-violet-300 dark:border-yellow-700 text-violet-700 dark:text-yellow-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-50 dark:hover:bg-yellow-900/20 transition-colors"
                    >
                      Retour
                    </button>

                    {selectedFriend.avatarUrl ? (
                      <img
                        src={selectedFriend.avatarUrl}
                        alt={selectedFriend.pseudo}
                        className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-zinc-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-700" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 dark:text-zinc-100 truncate">
                        {selectedFriend.pseudo}
                      </p>
                      <p
                        className={`text-xs text-${selectedFriendStatus?.color ?? "gray-400"} flex items-center gap-1`}
                      >
                        <FontAwesomeIcon
                          icon={faCircle}
                          className="text-[8px]"
                        />
                        {selectedFriendStatus?.label ?? "Status inconnu"}
                      </p>
                    </div>

                    <button
                      onClick={openMobileProfile}
                      className="border border-violet-300 dark:border-yellow-700 text-violet-600 dark:text-yellow-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-50 dark:hover:bg-yellow-900/20 transition-colors"
                    >
                      Afficher le profil
                    </button>
                  </div>

                  {/* Flux des messages de la conversation active */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
                    {currentMessages.map((msg, idx) => {
                      const isMe = msg.from === "me" || msg.from !== peerId;
                      return (
                        <div
                          key={`${msg.ts}-${idx}`}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl text-sm break-all ${
                              isMe
                                ? "bg-violet-600 dark:bg-yellow-700 text-white rounded-br-sm"
                                : "bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white rounded-bl-sm"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={`text-[10px] mt-1 text-right ${isMe ? "text-violet-200" : "text-gray-400 dark:text-zinc-400"}`}
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
                      <p className="text-center text-gray-400 dark:text-zinc-400 text-sm mt-16">
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

                  {/* Zone de saisie et bouton d'envoi */}
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 flex items-center gap-3 shrink-0">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder={`Message à ${selectedFriend.pseudo}...`}
                      className="min-w-0 flex-1 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400 dark:focus:border-yellow-500 transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!canSend}
                      className="bg-violet-600 dark:bg-yellow-600 hover:bg-violet-500 dark:hover:bg-yellow-500 disabled:bg-gray-200 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-zinc-400 text-sm px-4 text-center">
                  Sélectionne une conversation
                </div>
              )}
            </section>
          )}

          {mobileView === "profile" && (
            // Panneau profil mobile affiché en plein écran
            <section className="flex flex-1 min-h-0 flex-col items-center p-6 gap-4 bg-gray-50 dark:bg-zinc-900 overflow-y-auto">
              {selectedFriend ? (
                <>
                  <div className="w-full flex justify-end">
                    <button
                      onClick={closeMobileProfile}
                      className="border border-violet-300 dark:border-yellow-700 text-violet-700 dark:text-yellow-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-50 dark:hover:bg-yellow-900/20 transition-colors"
                    >
                      Retour au chat
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-2 mt-4">
                    {selectedFriend.avatarUrl ? (
                      <img
                        src={selectedFriend.avatarUrl}
                        alt={selectedFriend.pseudo}
                        className="w-20 h-20 rounded-full object-cover bg-gray-200 dark:bg-zinc-700"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-zinc-700" />
                    )}
                    <p className="font-semibold text-gray-800 dark:text-white text-lg">
                      {selectedFriend.pseudo}
                    </p>
                    <span
                      className={`${selectedFriendStatus?.style} border-none`}
                    >
                      {selectedFriendStatus?.label}
                    </span>
                  </div>

                  <hr className="w-full border-gray-200 dark:border-zinc-700" />

                  <div className="w-full space-y-3 text-sm text-gray-600 dark:text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400 dark:text-zinc-400">
                        Victoires
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {selectedFriend.level ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 dark:text-zinc-400">
                        Défaites
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {selectedFriend.lose ?? 0}
                      </span>
                    </div>
                  </div>

                  <hr className="w-full border-gray-200 dark:border-zinc-700" />

                  <div className="w-full flex flex-col gap-2">
                    <Level level={selectedFriend.level ?? 0} />
                  </div>
                </>
              ) : (
                <p className="text-gray-400 dark:text-zinc-400 text-sm mt-8 text-center">
                  Sélectionne un ami pour voir son profil
                </p>
              )}
            </section>
          )}
        </div>

        {/* Layout desktop: 3 colonnes fixes (liste, chat, profil) */}
        <div className="hidden md:flex h-full min-h-0">
          {/* Colonne gauche: conversations */}
          <section className="w-64 min-w-0 flex flex-col border-r border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden">
            <Search
              value={search}
              onChange={setSearch}
              className="dark:bg-zinc-900"
            />

            <div className="flex-1 min-h-0 overflow-y-auto">
              {isFriendsLoading && (
                <p className="text-center text-gray-400 dark:text-zinc-400 text-sm mt-8">
                  Chargement des amis...
                </p>
              )}

              {friendsError && (
                <p className="text-center text-red-500 text-sm mt-4 px-4">
                  {friendsError}
                </p>
              )}

              {filteredFriends.map((friend) => {
                const isSelected = selectedFriend?.id === friend.id;
                const msgs = messages[friend.id];
                const preview =
                  msgs && msgs.length > 0
                    ? msgs[msgs.length - 1].content
                    : "Démarrer une conversation";
                const presence =
                  friend.online === true
                    ? "ONLINE"
                    : friend.online === false
                      ? "OFFLINE"
                      : friend.status;
                const friendStatus = statusData.find(
                  (st) => st.value === presence,
                );

                return (
                  <button
                    key={friend.id}
                    onClick={() => openConversation(friend.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-zinc-600 hover:bg-violet-50 dark:hover:bg-yellow-900 transition-colors text-left ${isSelected ? "bg-violet-200 dark:bg-yellow-900/40" : ""}`}
                  >
                    <div className="relative shrink-0">
                      {friend.avatarUrl ? (
                        <img
                          src={friend.avatarUrl}
                          alt={friend.pseudo}
                          className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-zinc-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-700" />
                      )}
                      <FontAwesomeIcon
                        icon={faCircle}
                        className={`absolute bottom-0 right-0 text-xs text-${friendStatus?.color ?? "gray-400"}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${isSelected ? "text-violet-700 dark:text-yellow-300" : "text-gray-800 dark:text-zinc-100"}`}
                      >
                        {friend.pseudo}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-400 truncate">
                        {preview}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredFriends.length === 0 && (
                <p className="text-center text-gray-400 dark:text-zinc-400 text-sm mt-8">
                  Aucun ami trouvé
                </p>
              )}
            </div>
          </section>

          {/* Colonne centrale: conversation active */}
          <section className="flex-1 min-w-0 flex flex-col border-r border-gray-200 dark:border-zinc-700 overflow-hidden">
            {selectedFriend ? (
              <>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 shrink-0">
                  {selectedFriend.avatarUrl ? (
                    <img
                      src={selectedFriend.avatarUrl}
                      alt={selectedFriend.pseudo}
                      className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-zinc-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-700" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-zinc-100">
                      {selectedFriend.pseudo}
                    </p>
                    <p
                      className={`text-xs text-${selectedFriendStatus?.color ?? "gray-400"} flex items-center gap-1`}
                    >
                      <FontAwesomeIcon icon={faCircle} className="text-[8px]" />
                      {selectedFriendStatus?.label ?? "Status inconnu"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
                  {currentMessages.map((msg, idx) => {
                    const isMe = msg.from === "me" || msg.from !== peerId;
                    return (
                      <div
                        key={`${msg.ts}-${idx}`}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl text-sm break-all ${
                            isMe
                              ? "bg-violet-600 dark:bg-yellow-700 text-white rounded-br-sm"
                              : "bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white rounded-bl-sm"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 text-right ${isMe ? "text-violet-200" : "text-gray-400 dark:text-zinc-400"}`}
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
                    <p className="text-center text-gray-400 dark:text-zinc-400 text-sm mt-16">
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

                <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 flex items-center gap-3 shrink-0">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Message à ${selectedFriend.pseudo}...`}
                    className="min-w-0 flex-1 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400 dark:focus:border-yellow-500 transition-colors"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!canSend}
                    className="bg-violet-600 dark:bg-yellow-600 hover:bg-violet-500 dark:hover:bg-yellow-500 disabled:bg-gray-200 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-zinc-400 text-sm">
                Sélectionne une conversation
              </div>
            )}
          </section>

          {/* Colonne de droite: profil de l'ami   */}
          <section className="flex w-56 lg:w-64 min-w-0 shrink-0 flex-col items-center p-6 gap-4 bg-gray-50 dark:bg-zinc-900 overflow-y-auto">
            {selectedFriend ? (
              <>
                <div className="flex flex-col items-center gap-2 mt-4">
                  {selectedFriend.avatarUrl ? (
                    <img
                      src={selectedFriend.avatarUrl}
                      alt={selectedFriend.pseudo}
                      className="w-20 h-20 rounded-full object-cover bg-gray-200 dark:bg-zinc-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-zinc-700" />
                  )}
                  <p className="font-semibold text-gray-800 dark:text-white text-lg">
                    {selectedFriend.pseudo}
                  </p>
                  <span
                    className={`${selectedFriendStatus?.style} border-none`}
                  >
                    {selectedFriendStatus?.label}
                  </span>
                </div>

                <hr className="w-full border-gray-200 dark:border-zinc-700" />

                <div className="w-full space-y-3 text-sm text-gray-600 dark:text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-zinc-400">
                      Victoires
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {selectedFriend.level ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-zinc-400">
                      Défaites
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {selectedFriend.lose ?? 0}
                    </span>
                  </div>
                </div>

                <hr className="w-full border-gray-200 dark:border-zinc-700" />

                <div className="w-full flex flex-col gap-2">
                  <Level level={selectedFriend.level ?? 0} />
                </div>
              </>
            ) : (
              <p className="text-gray-400 dark:text-zinc-400 text-sm mt-8 text-center">
                Sélectionne un ami pour voir son profil
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Chat;
