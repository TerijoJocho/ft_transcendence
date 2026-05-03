import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

// This gateway manages real-time game interactions between players.

type SocketUser = { playerId: number };

type GameStateSnapshot = {
  gameId: number;
  board: string[][];
  turn: 'white' | 'black';
  moved: Record<string, boolean>;
  ep: { row: number; col: number } | null;
  halfmove: number;
  history: string[];
  //totalNbMoves: number;
  //winnerNbMoves: number;
  gameOver: boolean;
  status: string;
  lastMove: number[] | null;
  whiteTime: number | null;
  blackTime: number | null;
  clockStarted: boolean;
  gameResult: { winner: string; reason: string } | null;
};

type MovePayload = {
  gameId: number;
  state: GameStateSnapshot;
};

type JoinPayload = { gameId: number };

type GiveUpPayload = { gameId: number };

type CancelPayload = { gameId: number };

@WebSocketGateway({
  namespace: '/game',
  cors: {
    origin: (
      process.env.FRONTEND_ORIGINS ||
      'http://localhost:5173,http://127.0.0.1:5173'
    )
      .split(',')
      .map((s) => s.trim()),
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly gameStates = new Map<number, GameStateSnapshot>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameService: GameService,
  ) {}

  handleConnection(client: Socket) {
    const user = this.authenticate(client);
    if (!user) {
      client.emit('game_error', { message: 'Unauthorized websocket session.' });
      client.disconnect(true);
      return;
    }
    (client.data as { user?: SocketUser }).user = user;
  }

  handleDisconnect(client: Socket) {
    const joinedRooms = Array.from(client.rooms.values()).filter(
      (room) => room !== client.id,
    );
    joinedRooms.forEach((room) => {
      client.to(room).emit('opponent_disconnected', {
        room,
        playerId: (client.data as { user?: SocketUser }).user?.playerId,
      });
    });
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload,
  ) {
    if (!payload?.gameId || payload.gameId <= 0) {
      client.emit('game_error', { message: 'Invalid game id.' });
      return payload;
    }

    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('game_error', { message: 'Unauthorized player context.' });
      return payload;
    }

    try {
      const status = await this.gameService.getSession(
        payload.gameId,
        user.playerId,
      );
      if (status.gameStatus === 'COMPLETED') {
        client.emit('game_over', {
          winner: 'opponent',
          reason: 'giveup',
        });
        this.gameStates.delete(payload.gameId);
        return;
      }
    } catch {
      client.emit('game_error', { message: 'Access denied for this game.' });
      return payload;
    }

    const room = this.gameRoom(payload.gameId);
    await client.join(room);

    const snapshot = this.gameStates.get(payload.gameId);
    if (snapshot) {
      client.emit('sync_state', snapshot);
    }

    client.to(room).emit('player_joined', {
      gameId: payload.gameId,
      playerId: user.playerId,
    });
  }

  @SubscribeMessage('sync_request')
  async handleSyncRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinPayload,
  ) {
    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('game_error', { message: 'Unauthorized player context.' });
      return;
    }

    try {
      await this.gameService.getSession(payload.gameId, user.playerId);
    } catch {
      client.emit('game_error', { message: 'Access denied for this game.' });
      return;
    }

    const snapshot = this.gameStates.get(payload.gameId);
    if (!snapshot) {
      client.emit('sync_state', null);
      return;
    }
    client.emit('sync_state', snapshot);
  }

  @SubscribeMessage('move')
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MovePayload,
  ) {
    if (!payload?.gameId || !payload?.state) {
      client.emit('game_error', { message: 'Invalid move payload.' });
      return;
    }

    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('game_error', { message: 'Unauthorized player context.' });
      return;
    }

    try {
      await this.gameService.getSession(payload.gameId, user.playerId);
    } catch {
      client.emit('game_error', { message: 'Access denied for this game.' });
      return;
    }

    const room = this.gameRoom(payload.gameId);
    this.gameStates.set(payload.gameId, payload.state);

    client.to(room).emit('remote_move', payload.state);
    client.emit('move_ack', { ok: true });

    if (payload.state.gameOver) {
      this.server.to(room).emit('game_over', payload.state.gameResult);
      this.gameStates.delete(payload.gameId);
    }
  }

  @SubscribeMessage('ReponseDraw')
  async handleReponseDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { gameId: number; accept: boolean; state: GameStateSnapshot },
  ) {
    if (!payload?.gameId || payload.gameId <= 0) {
      client.emit('game_error', { message: 'Invalid game id.' });
      return;
    }

    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('game_error', { message: 'Unauthorized player context.' });
      return;
    }

    try {
      await this.gameService.getSession(payload.gameId, user.playerId);
    } catch {
      client.emit('game_error', { message: 'Access denied for this game.' });
      return;
    }

    const room = this.gameRoom(payload.gameId);
    if (payload.accept) {
      // Partie terminée par accord mutuel
      this.server
        .to(room)
        .emit('game_over', { winner: 'Draw', reason: 'agreement' });
      this.gameStates.delete(payload.gameId);
      // TODO: appeler le service pour persister le résultat si besoin
    } else {
      // L'adversaire refuse le match nul
      client.to(room).emit('draw_refused', { gameId: payload.gameId });
    }
  }

  @SubscribeMessage('AskDraw')
  async handleTie(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MovePayload,
  ) {
    if (!payload?.gameId || payload.gameId <= 0) {
      client.emit('game_error', { message: 'Invalid game id.' });
      return payload;
    }

    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('game_error', { message: 'Unauthorized player context.' });
      return payload;
    }

    const room = this.gameRoom(payload.gameId);
    const sockets = await this.server.in(room).fetchSockets();
    const opponent = sockets.find((s) => s.id !== client.id);
    if (opponent) opponent.emit('AskDraw', payload.state);
  }

  @SubscribeMessage('giveup')
  async handleGiveUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GiveUpPayload,
  ) {
    if (!payload?.gameId || payload.gameId <= 0) {
      client.emit('game_error', { message: 'Invalid game id.' });
      return;
    }

    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('game_error', { message: 'Unauthorized player context.' });
      return;
    }

    try {
      await this.gameService.getSession(payload.gameId, user.playerId);
    } catch {
      client.emit('game_error', { message: 'Access denied for this game.' });
      return;
    }

    this.server.to(this.gameRoom(payload.gameId)).emit('game_over', {
      winner: 'opponent',
      reason: 'giveup',
    });
    this.gameStates.delete(payload.gameId);
  }

  @SubscribeMessage('cancel_game')
  async handleCancelGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CancelPayload,
  ) {
    if (!payload?.gameId || payload.gameId <= 0) {
      client.emit('game_error', { message: 'Invalid game id.' });
      return;
    }

    const user = (client.data as { user?: SocketUser }).user;
    if (!user) {
      client.emit('game_error', { message: 'Unauthorized player context.' });
      return;
    }

    try {
      await this.gameService.getSession(payload.gameId, user.playerId);
    } catch {
      client.emit('game_error', { message: 'Access denied for this game.' });
      return;
    }

    this.server.to(this.gameRoom(payload.gameId)).emit('game_cancelled', {
      gameId: payload.gameId,
      playerId: user.playerId,
    });
    this.gameStates.delete(payload.gameId);
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

  private gameRoom(gameId: number) {
    return `game:${gameId}`;
  }
}
