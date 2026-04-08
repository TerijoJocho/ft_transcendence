import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { eq } from 'drizzle-orm';
import { playerTable, playerInsert } from 'src/shared/db/schema';
import { UpdateUserDto } from './dto/updateDto';
import { RedisService } from 'src/shared/services/redis.service';
import { Response } from 'express';
import { deleteDto } from './dto/deleteDTO';

@Injectable()
export class UserService {
  constructor(
    private readonly utils: UtilsService,
    private readonly redisService: RedisService,
  ) {}

  registerPlayers(mailAddress: string, gameName: string, pwd: string) {
    const currentPlayers: playerInsert = {
      playerName: gameName,
      mailAddress: mailAddress,
      pwd: pwd,
    };
    return this.utils.insertPlayers([currentPlayers], {
      id: playerTable.playerId,
      gameName: playerTable.playerName,
    });
  }

  async getDataUser(playerId: number) {
    const player = (await this.utils.findPlayersBy(
      'and',
      {
        playerId: playerTable.playerId,
        gameName: playerTable.playerName,
        mail: playerTable.mailAddress,
        avatarUrl: playerTable.avatarUrl,
      },
      eq(playerTable.playerId, playerId),
    )) as Array<{
      playerId: number;
      gameName: string;
      mail: string;
      avatarUrl: string;
    }>;

    if (!player.length) throw new NotFoundException('Player not found');
    return player;
  }

  async deleteUserbyId(playerId: number, data: deleteDto, response: Response) {
    const passwordRows = (await this.utils.findPlayersBy(
      'and',
      {
        playerId: playerTable.playerId,
        pass: playerTable.pwd,
      },
      eq(playerTable.playerId, playerId),
    )) as Array<{ playerId: number; pass: string }>;

    const password = passwordRows[0];
    if (password && password.pass != data.password)
      throw new UnauthorizedException();
    await this.utils.deletePlayersBy(
      'and',
      {
        playerId: playerTable.playerId,
        gameName: playerTable.playerName,
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
          gameName: playerTable.playerName,
          mailAddress: playerTable.mailAddress,
        },
        eq(playerTable.playerId, userId),
      );
      if (!result.length) throw new Error(`User  not Found`);
      return `User updated successfully`;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(`Failed to update user`);
    }
  }
}
