import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

// Le décorateur @WebSocketGateway déclare que cette classe gère des WebSockets.
// cors: true permet les connexions depuis ton frontend (à restreindre en prod).
@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  // Le serveur Socket.IO — tu peux t'en servir pour envoyer des messages
  // à n'importe quel client connecté.
  @WebSocketServer()
  server: Server;

  // Map qui associe un playerId à son socket.id
  // Ex: { 42: "socket_abc123", 7: "socket_xyz789" }
  private connectedPlayers = new Map<number, string>();

  // Appelé automatiquement quand un client se connecte
  handleConnection(client: Socket) {
    // Le client envoie son playerId dans les query params // a changer pour utiliser les tokens
    // Ex: ws://localhost/chat?playerId=42
    const playerId = parseInt(client.handshake.query.playerId as string);
    if (playerId) {
      this.connectedPlayers.set(playerId, client.id);
      console.log(`Player ${playerId} connected with socket ${client.id}`);
    }
  }

  // Appelé automatiquement quand un client se déconnecte
  handleDisconnect(client: Socket) {
    // On retire le joueur de la map
    for (const [playerId, socketId] of this.connectedPlayers.entries()) {
      if (socketId === client.id) {
        this.connectedPlayers.delete(playerId);
        console.log(`Player ${playerId} disconnected`);
        break;
      }
    }
  }

  // @SubscribeMessage écoute un "event" envoyé par le client.
  // Quand le client fait socket.emit("send_message", {...}),
  // cette méthode est appelée.
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { senderId: number; receiverId: number; content: string },
  ) {
    // 1. Sauvegarder le message en base de données
    const savedMessage = await this.chatService.saveMessage(
      data.senderId,
      data.receiverId,
      data.content,
    );

    // 2. Trouver le socket du destinataire
    const receiverSocketId = this.connectedPlayers.get(data.receiverId);

    const messagePayload = {
      messageId: savedMessage.messageId,
      senderId: savedMessage.senderId,
      receiverId: savedMessage.receiverId,
      content: savedMessage.content,
      sentAt: savedMessage.sentAt,
    };

    // 3. Si le destinataire est connecté, lui envoyer le message en temps réel
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('new_message', messagePayload);
    }

    // 4. Confirmer à l'expéditeur que le message a bien été envoyé
    client.emit('message_sent', { success: true, ...messagePayload });
  }
}