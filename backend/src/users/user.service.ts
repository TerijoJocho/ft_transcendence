import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { eq } from 'drizzle-orm';
import { playerTable, playerInsert } from 'src/shared/db/schema';
import { UpdateUserDto } from './dto/updateDto';
import { RedisService } from 'src/shared/services/redis.service';
import { Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    private readonly utils: UtilsService,
    private readonly redisService: RedisService,
  ) {}

  registerPlayers(mailAddress: string, gameName: string, pwd: string) {
    const currentPlayers: playerInsert = {
      gameName: gameName,
      mailAddress: mailAddress,
      pwd: pwd,
    };
    return this.utils.insertPlayers([currentPlayers], {
      id: playerTable.playerId,
      gameName: playerTable.gameName,
    });
  }

  async getDataUser(playerId: number) {
    return await this.utils.findPlayersBy(
      'and',
      {
        playerId: playerTable.playerId,
        gameName: playerTable.gameName,
        avatarUrl: playerTable.avatarUrl,
      },
      eq(playerTable.playerId, playerId),
    );
  }

  async deleteUserbyId(playerId: number, response: Response) {
    await this.utils.deletePlayersBy(
      'and',
      {
        playerId: playerTable.playerId,
        gameName: playerTable.gameName,
        mailAddress: playerTable.mailAddress,
      },
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
      const result = await this.utils.updatePlayersBy(
        userData,
        'and',
        {
          playerId: playerTable.playerId,
          gameName: playerTable.gameName,
          mailAddress: playerTable.mailAddress,
        },
        eq(playerTable.playerId, userId),
      );
      if (!result) throw new Error(`User:${userId} not Found`);
      return `User ${userId} updated successfully`;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(`Failed to update user ${userId}`);
    }
  }
}
