import { Injectable, Param, Post, Get } from '@nestjs/common';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { eq } from 'drizzle-orm';
import { playerTable } from 'src/shared/db/schema';
import { UpdateUserDto } from './dto/updateDto';
import { RedisService } from 'src/shared/services/redis.service';
import { Response } from 'express';

@Injectable()
export class UserService {
    constructor(
        private readonly utils: UtilsService,
        private readonly redisService: RedisService
    ) {}

    async getDataUser(playerId: number)
    {
        return await this.utils.findPlayersBy(
            'and',
            {
                playerId : playerTable.playerId,
                gameName : playerTable.gameName,
                avatarUrl : playerTable.avatarUrl,
            },
            eq(playerTable.playerId, playerId),
        ) //as Array<{ playerId : number; gameName : string; avatarUrl : string }>
    }

    async deleteUserbyId(playerId: number, response : Response) {

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
        response.status(200).json({ message: 'User ' + playerId + ' deleted successfully' });
    }

    updateUserData(userId: number, userData: UpdateUserDto) {
        this.utils.updatePlayersBy(userData,
            'and',
            {
                playerId: playerTable.playerId,
                gameName: playerTable.gameName,
                mailAddress: playerTable.mailAddress,
            },
            eq(playerTable.playerId, userId),
        );
        return { message: 'User data ' + userData + ' updated successfully' };
    }
}