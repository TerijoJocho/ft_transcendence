import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  NotFoundException,
} from '@nestjs/common';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { eq, ne } from 'drizzle-orm';
import {
  playerTable,
  playerInsert,
  friendshipTable,
  participationTable,
  playerSelect,
} from 'src/shared/db/schema';
import { UpdateUserDto } from './dto/updateDto';
import { RedisService } from 'src/shared/services/redis.service';
import { Response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    private readonly utils: UtilsService,
    private readonly redisService: RedisService,
  ) {}

  registerPlayers(mailAddress: string, gameName: string, pwd?: string) {
    const currentPlayers: playerInsert = {
      playerName: gameName,
      mailAddress: mailAddress,
      pwd: pwd || undefined,
    };
    return this.utils.insertPlayers([currentPlayers], {
      id: playerTable.playerId,
      pseudo: playerTable.playerName,
    });
  }

  async getDataUser(playerId: number) {
    const player = (await this.utils.findPlayersBy(
      'and',
      {
        id: playerTable.playerId,
        pseudo: playerTable.playerName,
        email: playerTable.mailAddress,
        avatarUrl: playerTable.avatarUrl,
      },
      eq(playerTable.playerId, playerId),
    )) as Array<{
      id: number;
      pseudo: string;
      email: string;
      avatarUrl: string;
    }>;

    if (!player.length) throw new NotFoundException('Player not found');
    return player[0];
  }

  async deleteUserbyId(playerId: number, response: Response) {
    const user = (await this.utils.findPlayersBy(
      'and',
      undefined,
      eq(playerTable.playerId, playerId),
    )) as playerSelect[];
    if (user.length === 0) throw new NotFoundException('Player not found');

    await this.utils.deleteParticipationsBy(
      'and',
      undefined,
      eq(participationTable.playerId, playerId),
    );

    await this.utils.deleteFriendshipsBy(
      'or',
      undefined,
      eq(friendshipTable.player1Id, playerId),
      eq(friendshipTable.player2Id, playerId),
    );

    await this.utils.deletePlayersBy(
      'and',
      undefined,
      eq(playerTable.playerId, playerId),
    );
    await this.redisService.getClient().del('refreshToken:' + playerId);
    response.clearCookie('Access');
    response.clearCookie('Refresh');
    response
      .status(200)
      .json({ message: 'User ' + playerId + ' deleted successfully' });
  }

  async updateUserData(
    userId: number,
    userData: UpdateUserDto,
  ): Promise<string> {
    try {
      const updatePayload: Partial<playerInsert> = {};

      if (userData.newPassword !== undefined) {
        updatePayload.pwd = userData.newPassword;
      }
      if (userData.avatar !== undefined) {
        updatePayload.avatarUrl = userData.avatar;
      }

      const playerNameCheck = await this.utils.findPlayersBy(
        'and',
        undefined,
        eq(playerTable.playerName, userData.pseudo || ''),
        ne(playerTable.playerId, userId),
      );
      if (playerNameCheck.length > 0) {
        throw new InternalServerErrorException('Pseudo already exists');
      }

      const emailCheck = await this.utils.findPlayersBy(
        'and',
        undefined,
        eq(playerTable.mailAddress, userData.email || ''),
        ne(playerTable.playerId, userId),
      );
      if (emailCheck.length > 0) {
        throw new InternalServerErrorException('Email already exists');
      }

      await this.utils.updatePlayersBy(
        updatePayload,
        'and',
        {
          playerId: playerTable.playerId,
          gameName: playerTable.playerName,
          mailAddress: playerTable.mailAddress,
        },
        eq(playerTable.playerId, userId),
      );
      return 'User updated successfully';
    } catch (error) {
      throw new ServiceUnavailableException(error, 'Failed to update user');
    }
  }
}
