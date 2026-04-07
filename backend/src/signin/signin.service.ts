import { Injectable, Post } from '@nestjs/common';
import { playerInsert, playerTable } from '../shared/db/schema';
import { UtilsService } from '../shared/services/utils.func.service';

@Injectable()
export class SigninService {
  constructor(private readonly utils: UtilsService) {}

  @Post()
  registerPlayers(mailAddress: string, playerName: string, pwd: string) {
    const currentPlayers: playerInsert = {
      playerName: playerName,
      mailAddress: mailAddress,
      pwd: pwd,
    };
    try {
      const result = this.utils.insertPlayers([currentPlayers], {
        id: playerTable.playerId,
        playerName: playerTable.playerName,
      });
      return result;
    } catch (error) {
      console.error('Error inserting player:', error);
      throw error;
    }
  }
}
