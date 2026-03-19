import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  senderId: number;
  content: string;
  sentAt: string;
}

export function useChat(playerId: number) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connexion au namespace /chat du backend
    // On passe le playerId en query param pour que le Gateway
    // sache qui vient de se connecter
    socketRef.current = io('/chat', {
      query: { playerId },
      // Si tu es en HTTPS/WSS via nginx, ça marche automatiquement
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat!');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected to chat!');
    });

    // Écoute les messages entrants
    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Confirmation d'envoi
    socket.on('message_sent', (message: Message) => {
      setMessages(prev => [...prev, { ...message, senderId: playerId }]);
    });

    // Cleanup : déconnecte quand le composant est démonté
    return () => {
      socket.disconnect();
    };
  }, [playerId]);

  const sendMessage = useCallback((receiverId: number, content: string) => {
    socketRef.current?.emit('send_message', {
      senderId: playerId,
      receiverId,
      content,
    });
  }, [playerId]);

  return { messages, isConnected, sendMessage };
}