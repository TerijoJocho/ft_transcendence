import { useState } from 'react';
import Header from '../components/Header.tsx';
// import { useChat } from '../hooks/useChat';
import { friendsData } from '../data/sideBarData';
import statusData from '../data/statusData.ts';
import type { FriendData } from '../data/sideBarData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMagnifyingGlass, faCircle } from '@fortawesome/free-solid-svg-icons';

function Chat() {
    // const isConnected = true; // à brancher sur useChat() plus tard

    const [search, setSearch] = useState('');
    const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(friendsData[0]);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    // Filtre la liste d'amis selon la barre de recherche
    const filteredFriends = friendsData.filter(f =>
        f.pseudo.toLowerCase().includes(search.toLowerCase())
    );

    // Récupère les messages de la conv sélectionnée
    const currentMessages = selectedFriend ? (messages[selectedFriend.id] ?? []) : [];

    // Récupère le status du selectedFriend
    const selectedFriendStatus = statusData.find(st => st.value === selectedFriend.status);

    function handleSend() {
        if (!inputValue.trim() || !selectedFriend) return;

        const newMsg = {
            id: Date.now(),
            from: 'me' as const,
            content: inputValue.trim(),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => ({
            ...prev,
            [selectedFriend.id]: [...(prev[selectedFriend.id] ?? []), newMsg],
        }));
        setInputValue('');
    }

    return (
        <div className="border rounded-md bg-white text-black h-full flex flex-col">
            <Header title="Messages privés" />

            <div className="flex border-t flex-1 overflow-hidden">

                {/* Colonne gauche : liste des conversations */}
                <section className="w-64 max-h-screen flex flex-col border-r shrink-0">

                    {/* Barre de recherche */}
                    <div className="p-3 border-b">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Rechercher..."
                                className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Liste des conversations */}
                    <div className="overflow-y-auto flex-1">
                        {filteredFriends.map(friend => {
                            const isSelected = selectedFriend?.id === friend.id;
                            const lastMsg = messages[friend.id];
                            const preview = lastMsg ? lastMsg[lastMsg.length - 1].content : 'Démarrer une conversation';
                            const currentFriendStatus = statusData.find((st) => st.value === friend.status);
                            console.log()
                            return (
                                <button
                                    key={friend.id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-violet-50 transition-colors text-left
                                        ${isSelected ? 'bg-violet-100 border-l-violet-500' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <FontAwesomeIcon icon={friend.avatar} className="text-3xl text-gray-400" />
                                        <FontAwesomeIcon
                                            icon={faCircle}
                                            className={`absolute bottom-0 right-0 ${currentFriendStatus?.color} text-xs`}
                                        />
                                    </div>

                                    {/* Pseudo + aperçu du dernier message */}
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-violet-700' : 'text-gray-800'}`}>
                                            {friend.pseudo}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">{preview}</p>
                                    </div>
                                </button>
                            );
                        })}

                        {filteredFriends.length === 0 && (
                            <p className="text-center text-gray-400 text-sm mt-8">Aucun ami trouvé</p>
                        )}
                    </div>
                </section>

                {/* ── Colonne centrale : zone de messages ── */}
                <section className="flex-1 flex flex-col border-r overflow-hidden">

                    {selectedFriend ? (
                        <>
                            {/* Header de la conv */}
                            <div className="flex items-center gap-3 px-5 py-3 border-b bg-gray-50 shrink-0">
                                <FontAwesomeIcon icon={selectedFriend.avatar} className="text-2xl text-gray-400" />
                                <div>
                                    <p className="font-semibold text-gray-800">{selectedFriend.pseudo}</p>
                                    <p className={`text-xs ${selectedFriendStatus?.color} flex items-center gap-1`}>
                                        <FontAwesomeIcon icon={faCircle} className="text-[8px]" />
                                        {selectedFriendStatus?.label ?? "Status inconnu"}
                                    </p>
                                </div>
                            </div>

                            {/* Bulles de messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                                {currentMessages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm
                                            ${msg.from === 'me'
                                                ? 'bg-violet-600 text-white rounded-br-sm'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                            }`}
                                        >
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right
                                                ${msg.from === 'me' ? 'text-violet-200' : 'text-gray-400'}`}
                                            >
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {currentMessages.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm mt-16">
                                        Aucun message pour l'instant.<br />
                                        Dis bonjour à {selectedFriend.pseudo} !
                                    </p>
                                )}
                            </div>

                            {/* Zone de saisie */}
                            <div className="px-4 py-3 border-t bg-gray-50 flex items-center gap-3 shrink-0">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder={`Message à ${selectedFriend.pseudo}...`}
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400 transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
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
                            {/* Avatar + nom */}
                            <div className="flex flex-col items-center gap-2 mt-4">
                                <FontAwesomeIcon icon={selectedFriend.avatar} className="text-6xl text-gray-300" />
                                <p className="font-semibold text-gray-800 text-lg">{selectedFriend.pseudo}</p>
                                <span className={selectedFriendStatus.style}>
                                    {selectedFriendStatus.label}
                                </span>
                            </div>

                            <hr className="w-full border-gray-200" />

                            {/* Infos hard-codées — à brancher sur /users/:id */}
                            <div className="w-full space-y-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ELO</span>
                                    <span className="font-semibold text-gray-800">{selectedFriend.elo}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Victoires</span>
                                    <span className="font-semibold text-gray-800">42</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Défaites</span>
                                    <span className="font-semibold text-gray-800">17</span>
                                </div>
                            </div>

                            <hr className="w-full border-gray-200" />

                            {/* Actions */}
                            <div className="w-full flex flex-col gap-2">
                                <button className="w-full text-sm text-violet-600 border border-violet-300 rounded-lg py-1.5 hover:bg-violet-50 transition-colors">
                                    Voir le profil
                                </button>
                                <button className="w-full text-sm text-red-500 border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition-colors">
                                    Bloquer
                                </button>
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