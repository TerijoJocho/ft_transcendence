import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { RedisService } from 'src/shared/services/redis.service';
import { Socket } from 'socket.io';

type SocketUser = { playerId: number };

@WebSocketGateway({
  namespace: '/presence',
  cors: {
    origin: [
      'https://localhost',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  },
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly presenceTtlSeconds = 60;
  private readonly refreshIntervalMs = 20_000;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    const user = this.authenticate(client);
    if (!user) {
      client.disconnect(true);
      return;
    }

    (client.data as { user?: SocketUser; presenceTimer?: NodeJS.Timeout }).user =
      user;

    await this.markSocketOnline(client, user.playerId);

    const timer = setInterval(() => {
      void this.refreshPresence(client, user.playerId);
    }, this.refreshIntervalMs);

    (client.data as { user?: SocketUser; presenceTimer?: NodeJS.Timeout })
      .presenceTimer = timer;
  }

  async handleDisconnect(client: Socket) {
    const user = (client.data as { user?: SocketUser }).user;
    const timer = (client.data as { presenceTimer?: NodeJS.Timeout })
      .presenceTimer;

    if (timer) {
      clearInterval(timer);
      (client.data as { presenceTimer?: NodeJS.Timeout }).presenceTimer =
        undefined;
    }

    if (!user?.playerId) return;

    await this.markSocketOffline(client.id, user.playerId);
  }

  private authenticate(client: Socket): SocketUser | null {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return null;

    const accessToken = cookieHeader
      .split(';')
      .map((chunk) => chunk.trim())
      .find((chunk) => chunk.startsWith('Access='))
      ?.split('=')[1];

    if (!accessToken) return null;

    try {
      const payload = this.jwtService.verify<{ sub: number }>(accessToken, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      });

      if (!payload?.sub) return null;

      return { playerId: payload.sub };
    } catch {
      return null;
    }
  }

  private getSocketsKey(userId: number) {
    return `user:${userId}:sockets`;
  }

  private getOnlineKey(userId: number) {
    return `user:${userId}:online`;
  }

  private async markSocketOnline(client: Socket, userId: number) {
    const redisClient = this.redisService.getClient();
    const socketsKey = this.getSocketsKey(userId);
    const onlineKey = this.getOnlineKey(userId);

    await redisClient.sAdd(socketsKey, client.id);
    await Promise.all([
      redisClient.expire(socketsKey, this.presenceTtlSeconds),
      redisClient.set(onlineKey, 'true', {
        EX: this.presenceTtlSeconds,
      }),
    ]);
  }

  private async refreshPresence(client: Socket, userId: number) {
    if (!client.connected) return;

    const redisClient = this.redisService.getClient();
    const socketsKey = this.getSocketsKey(userId);
    const onlineKey = this.getOnlineKey(userId);

    await Promise.all([
      redisClient.expire(socketsKey, this.presenceTtlSeconds),
      redisClient.set(onlineKey, 'true', {
        EX: this.presenceTtlSeconds,
      }),
    ]);
  }

  private async markSocketOffline(socketId: string, userId: number) {
    const redisClient = this.redisService.getClient();
    const socketsKey = this.getSocketsKey(userId);
    const onlineKey = this.getOnlineKey(userId);

    await redisClient.sRem(socketsKey, socketId);

    const socketCount = await redisClient.sCard(socketsKey);
    if (socketCount === 0) {
      await Promise.all([redisClient.del(socketsKey), redisClient.del(onlineKey)]);
      return;
    }

    await Promise.all([
      redisClient.expire(socketsKey, this.presenceTtlSeconds),
      redisClient.set(onlineKey, 'true', {
        EX: this.presenceTtlSeconds,
      }),
    ]);
  }
}