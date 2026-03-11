import {Injectable, Param, Post, Get } from '@nestjs/common';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { eq } from 'drizzle-orm';
import { playerTable } from 'src/shared/db/schema';

@Injectable()
export class UserService{
    constructor(private readonly utils: UtilsService) {}

    deleteUserbyId(playerId: number) {
        return this.utils.deletePlayersBy(
            'and',
            { 
                playerId: playerTable.playerId,
                gameName: playerTable.gameName,
                mailAddress: playerTable.mailAddress,
            },
            eq(playerTable.playerId, playerId),
        );
        //supp le token, ou le cookie
    }

    logoutUser(userId: number) {
        
        return { message: 'User logged out successfully' };
    }
}
