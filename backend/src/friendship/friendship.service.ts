import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { eq, or, ilike, ne, and } from 'drizzle-orm';
import { friendshipTable, playerTable } from 'src/shared/db/schema';
import { FriendResponseDto } from './dto/FriendResponseDto';

type FriendListItem = {
  friendshipId: number;
  id: number;
  pseudo: string;
  status: string;
  friendshipStatus: string;
  avatarUrl: string | null;
  level: number;
  lose: number;
};

@Injectable()
export class FriendshipService {
  constructor(private readonly utilsService: UtilsService) {}
  //ajout d'un ami//////////////////////////////////////////////////////////////////////////////////////

  async create(CurrentUserId: number, playerAdded: number) {
    if (CurrentUserId === playerAdded)
      throw new BadRequestException('You cannot add yourself as a friend');
    const checkPlayerAdded = await this.utilsService.findPlayersBy(
      'and',
      undefined,
      eq(playerTable.playerId, playerAdded),
    );
    if (checkPlayerAdded.length === 0)
      throw new NotFoundException('Player added not found');
    const player1Id = Math.min(CurrentUserId, playerAdded);
    const player2Id = Math.max(CurrentUserId, playerAdded);
    const existing = await this.utilsService.findFriendshipsBy(
      'and',
      undefined,
      eq(friendshipTable.player1Id, player1Id),
      eq(friendshipTable.player2Id, player2Id),
    );
    if (existing.length > 0)
      throw new ConflictException('you are already friends');
    const inserted = await this.utilsService.insertFriendships([
      {
        player1Id,
        player2Id,
        requesterId: CurrentUserId,
        friendshipStatus: 'PENDING',
      },
    ]);
    const id = inserted[0].friendshipId as number;

    const pseudoPlayer = (await this.utilsService.findPlayersBy(
      'and',
      {
        pseudo: playerTable.playerName,
      },
      eq(playerTable.playerId, playerAdded),
    )) as Array<{ pseudo: string }>;

    const friendResponse: FriendResponseDto = {
      friendshipId: id,
      id: playerAdded,
      pseudo: pseudoPlayer[0].pseudo,
      status: 'ONLINE',
      avatarUrl: null,
      friendshipStatus: 'PENDING',
    };
    return friendResponse;
  }

  ////////////////////////////////////// get ///////////////////////////////////////////////////////////////
  async list(CurrentUserId: number) {
    const friendships = (await this.utilsService.findFriendshipsBy(
      'or',
      {
        friendshipId: friendshipTable.friendshipId,
        player1Id: friendshipTable.player1Id,
        player2Id: friendshipTable.player2Id,
        requesterId: friendshipTable.requesterId,
        friendshipStatus: friendshipTable.friendshipStatus,
      },
      and(
        or(
          eq(friendshipTable.player1Id, CurrentUserId),
          eq(friendshipTable.player2Id, CurrentUserId),
        ),
        eq(friendshipTable.friendshipStatus, 'ADDED'),
      ),
      and(
        or(
          eq(friendshipTable.player1Id, CurrentUserId),
          eq(friendshipTable.player2Id, CurrentUserId),
        ),
        ne(friendshipTable.requesterId, CurrentUserId),
        eq(friendshipTable.friendshipStatus, 'PENDING'),
      ),
    )) as Array<{
      friendshipId: number;
      player1Id: number;
      player2Id: number;
      requesterId: number;
      friendshipStatus: string;
    }>;

    const results: Array<FriendListItem | null> = await Promise.all(
      friendships.map(async (f) => {
        const friendId = f.player1Id === CurrentUserId ? f.player2Id : f.player1Id;
        const rows = (await this.utilsService.findPlayersBy(
          'and',
          {
            id: playerTable.playerId,
            pseudo: playerTable.playerName,
            avatarUrl: playerTable.avatarUrl,
          },
          eq(playerTable.playerId, friendId),
        )) as Array<{ id: number; pseudo: string; avatarUrl: string | null }>;
        const friend = rows[0];
        if (!friend) return null;

        const stats = await this.utilsService.getGamesResCounts(friendId);
        const levelVal = stats && stats[0] ? stats[0].totalWins : 0;
        const totalLosses = stats && stats[0] ? stats[0].totalLosses : 0;

        return {
          id: friend.id,
          friendshipId: f.friendshipId,
          pseudo: friend.pseudo,
          status: 'ONLINE',
          friendshipStatus: f.friendshipStatus,
          avatarUrl: friend.avatarUrl,
          level: levelVal,
          lose: totalLosses,
        };
      }),
    );
    return results.filter((r): r is FriendListItem => r !== null);
  }

//////////////////////////////// delete /////////////////////////////////////////////////////////
  async delete(CurrentUserId: number, playerAdded: number) {
    if (CurrentUserId === playerAdded)
      throw new BadRequestException('You cannot delete yourself');
    const checkPlayerDelete = await this.utilsService.findPlayersBy(
      'and',
      undefined,
      eq(playerTable.playerId, playerAdded),
    );
    if (checkPlayerDelete.length === 0)
      throw new NotFoundException(
        'you want to delete a friendship with a player that does not exist',
      );
    const player1Id = Math.min(CurrentUserId, playerAdded);
    const player2Id = Math.max(CurrentUserId, playerAdded);
    const existing = await this.utilsService.findFriendshipsBy(
      'and',
      undefined,
      eq(friendshipTable.player1Id, player1Id),
      eq(friendshipTable.player2Id, player2Id),
    );
    if (existing.length === 0)
      throw new NotFoundException('you are not friends with this player');

    await this.utilsService.deleteFriendshipsBy(
      'and',
      undefined,
      eq(friendshipTable.player1Id, player1Id),
      eq(friendshipTable.player2Id, player2Id),
    );

    return `Friendship between player ${CurrentUserId} and player ${playerAdded} deleted successfully`;
  }

  ////////////////////////// accepté un ami //////////////////////////////
  async changeFriendshipStatus(CurrentUserId: number, target: number) {
    if (CurrentUserId === target)
      throw new BadRequestException('You cannot add yourself as a friend');
    const player1Id = Math.min(CurrentUserId, target);
    const player2Id = Math.max(CurrentUserId, target);
    const pending = await this.utilsService.findFriendshipsBy(
      'and',
      undefined,
      eq(friendshipTable.player1Id, player1Id),
      eq(friendshipTable.player2Id, player2Id),
      ne(friendshipTable.requesterId, CurrentUserId),
      eq(friendshipTable.friendshipStatus, 'PENDING'),
    );
    if (pending.length === 0)
      throw new NotFoundException('No pending friend request found');
    const updated = await this.utilsService.updateFriendshipsBy(
      { friendshipStatus: 'ADDED'},
      'and',
      undefined,
      eq(friendshipTable.player1Id, player1Id),
      eq(friendshipTable.player2Id, player2Id),
      ne(friendshipTable.requesterId, CurrentUserId),
      eq(friendshipTable.friendshipStatus, 'PENDING'),
    );
    if (updated.length === 0)
      throw new BadRequestException('Failed to update friend request');

    return `Player ${CurrentUserId} accepted friend request from player ${target}`;
  }

  ///////////////////////// recherche d'un user ///////////////////////////////
  async searchUsers(CurrentUserId: number, username: string) {
    const searchTerm = username?.trim();
    if (!searchTerm)
      throw new BadRequestException('username query parameter is required');

    const users = (await this.utilsService.findPlayersBy(
      'and',
      {
        id: playerTable.playerId,
        pseudo: playerTable.playerName,
        avatarUrl: playerTable.avatarUrl,
      },
      ilike(playerTable.playerName, `%${searchTerm}%`),
      ne(playerTable.playerId, CurrentUserId),
    )) as Array<{ id: number; pseudo: string; avatarUrl: string | null }>;

    if (!users.length) return [];

    return users.map((user) => ({
      id: user.id,
      pseudo: user.pseudo,
      avatarUrl: user.avatarUrl,
    }));
  }
}