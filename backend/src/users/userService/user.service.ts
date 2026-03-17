import {Injectable, Param, Post, Get } from '@nestjs/common';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { eq } from 'drizzle-orm';
import { playerTable } from 'src/shared/db/schema';
import { UpdateUserDto } from '../updateDto';

@Injectable()
export class UserService{
    constructor(private readonly utils: UtilsService) {}

    deleteUserbyId(playerId: number)
    {
        this.utils.deletePlayersBy(
            'and',
            { 
                playerId: playerTable.playerId,
                gameName: playerTable.gameName,
                mailAddress: playerTable.mailAddress,
            },
            eq(playerTable.playerId, playerId),
        );
        return { message: 'User ' + playerId + ' deleted successfully' };
        //supp le token, ou le cookie
    }

    updateUserData(userId: number, userData: UpdateUserDto) 
    {
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