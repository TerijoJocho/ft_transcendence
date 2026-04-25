import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

type SocketUser = { playerId: number };

type ChatMessage = {
  from: number;
  to: number;
  content: string;
  ts: string;
};

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [
      'https://localhost',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly roomMessages = new Map<string, ChatMessage[]>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const user = this.authenticate(client);
    if (!user) {
      client.emit('chat_error', { message: 'Unauthorized websocket session.' });
      client.disconnect(true);
      return;
    }
    (client.data as { user?: SocketUser }).user = user;
  }

  @SubscribeMessage('join_dm')
  handleJoinDm(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { peerId: number },
  ) {
    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('chat_error', { message: 'Unauthorized player context.' });
      return;
    }
    if (!payload?.peerId || payload.peerId <= 0) {
      client.emit('chat_error', { message: 'Invalid peer id.' });
      return;
    }
    if (payload.peerId === user.playerId) {
      client.emit('chat_error', {
        message: 'Cannot create chat with yourself.',
      });
      return;
    }

    const room = this.dmRoom(user.playerId, payload.peerId);
    void client.join(room);

    const history = this.roomMessages.get(room) ?? [];
    client.emit('chat_history', history);
  }

  @SubscribeMessage('send_dm')
  handleSendDm(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { peerId: number; content: string },
  ) {
    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('chat_error', { message: 'Unauthorized player context.' });
      return;
    }
    if (!payload?.peerId || payload.peerId <= 0) {
      client.emit('chat_error', { message: 'Invalid peer id.' });
      return;
    }

    const content = payload.content?.trim();
    if (!content) {
      client.emit('chat_error', { message: 'Message cannot be empty.' });
      return;
    }

    const room = this.dmRoom(user.playerId, payload.peerId);
    const message: ChatMessage = {
      from: user.playerId,
      to: payload.peerId,
      content,
      ts: new Date().toISOString(),
    };

    const history = this.roomMessages.get(room) ?? [];
    history.push(message);
    this.roomMessages.set(room, history.slice(-200));

    this.server.to(room).emit('recv_dm', message);
  }

  private authenticate(client: Socket): SocketUser | null {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return null;

    const accessToken = cookieHeader
      .split(';')
      .map((chunk) => chunk.trim())
      .find((chunk) => chunk.startsWith('Access='))
      ?.split('=')[1];

    if (!accessToken)
      return null;


    try {
      const payload = this.jwtService.verify<{ sub: number }>(accessToken, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      });
      if (!payload?.sub)
        return null;
      return { playerId: payload.sub };
    } catch {
        return null;
    }
  }

  private dmRoom(a: number, b: number) {
    const [min, max] = [a, b].sort((x, y) => x - y);
    return `dm:${min}:${max}`;
  }
}
