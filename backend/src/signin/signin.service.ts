import { Injectable, Post } from '@nestjs/common';
import { playerInsert, playerTable } from '../shared/db/schema';
import { UtilsService } from '../shared/services/utils.func.service';

@Injectable()
export class SigninService {
  constructor(private readonly utils: UtilsService) {}

  @Post()
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
}
