import { Injectable, Post } from '@nestjs/common';
import { player, playerTable } from 'src/db/schema';
import { insertPlayers } from '../../gloss_func';

@Injectable()
export class SigninService {
  @Post()
  registerPlayers(mailAddress: string, gameName: string, pwd: string) {
    const currentPlayers: player = {
      gameName: gameName,
      mailAddress: mailAddress,
      pwd: pwd,
    };
    return insertPlayers([currentPlayers], {
      id: playerTable.playerId,
      gameName: playerTable.gameName,
    });
  }
}
