import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UtilsService } from '../shared/services/utils.func.service';
import { NewGameDto } from './dto/new-game.dto';
import { EndGameDto } from './dto/end-game.dto';
import { gameTable, participationTable } from 'src/shared/db/schema';
import type {
  gameSelect,
  gameInsert,
  participationInsert,
  participationSelect,
} from 'src/shared/db/schema';
import { eq, ne } from 'drizzle-orm';

@Injectable()
export class GameService {
  constructor(private readonly utilsService: UtilsService) {}

  convertDtoToGameInsert(gameObject: NewGameDto): gameInsert[] {
    if (gameObject) {
      switch (gameObject.gameMode) {
        case 'CLASSIC':
          return [
            {
              gameMode: 'CLASSIC',
            },
          ] as gameInsert[];
        case 'BLITZ':
          return [
            {
              gameMode: 'BLITZ',
            },
          ] as gameInsert[];
        case 'BULLET':
          return [
            {
              gameMode: 'BULLET',
            },
          ] as gameInsert[];
        default:
          throw new BadRequestException('Invalid or unprovided game mode');
      }
    } else throw new BadRequestException('Invalid game DTO');
  }

  convertDtoToParticipationInsert(
    gameInfo: NewGameDto,
    playerId: number,
    gameId: number,
  ): participationInsert[] {
    if (gameInfo) {
      switch (gameInfo.playerColor) {
        case 'BLACK':
          return [
            {
              playerId: playerId,
              playerColor: 'BLACK',
              gameId: gameId,
            },
          ] as participationInsert[];
        case 'WHITE':
          return [
            {
              playerId: playerId,
              playerColor: 'WHITE',
              gameId: gameId,
            },
          ] as participationInsert[];
        default:
          throw new BadRequestException('Invalid participation DTO');
      }
    } else throw new BadRequestException('Invalid participation DTO');
  }

  async generateNewGame(gameInfo: NewGameDto, playerId: number) {
    const createdNewGame = (
      await this.utilsService.insertGames(this.convertDtoToGameInsert(gameInfo))
    )[0] as gameSelect;
    try {
      await this.utilsService.insertParticipations(
        this.convertDtoToParticipationInsert(
          gameInfo,
          playerId,
          createdNewGame.gameId,
        ),
      );
    } catch {
      await this.utilsService.deleteGamesBy(
        'and',
        undefined,
        eq(gameTable.gameId, createdNewGame.gameId),
      );
      throw new ServiceUnavailableException(
        'Cannot create participation for first player.',
      );
    }
  }

  async joinGame(gameId: number, playerId: number) {
    //check if game exists and is pending
    const gameRows: { [x: string]: unknown }[] | gameSelect[] =
      await this.utilsService.findGamesBy(
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
        eq(gameTable.gameStatus, 'PENDING'),
      );
    if (gameRows.length === 0)
      throw new NotFoundException('Game not found or already started.');
    //create new participation for second player
    let newGameDtoObject: NewGameDto;
    const participationRows: { [w: string]: any }[] =
      await this.utilsService.findParticipationsBy(
        'and',
        { color: participationTable.playerColor },
        eq(participationTable.gameId, gameId),
        ne(participationTable.playerId, playerId),
      );
    if (participationRows.length === 0)
      throw new NotFoundException('First player participation not found.');
    if (participationRows[0].color === 'WHITE')
      newGameDtoObject = { playerColor: 'BLACK' };
    else newGameDtoObject = { playerColor: 'WHITE' };
    try {
      await this.utilsService.insertParticipations(
        this.convertDtoToParticipationInsert(
          newGameDtoObject,
          playerId,
          gameId,
        ),
      );
    } catch {
      throw new ServiceUnavailableException(
        'Cannot create participation for second player.',
      );
    }
    //update game status to ongoing and set totalNbMoves and winnerNbMoves to 0
    try {
      await this.utilsService.updateGamesBy(
        {
          gameStatus: 'ONGOING',
          totalNbMoves: 0,
          winnerNbMoves: 0,
        } as Partial<gameInsert>,
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
      );
    } catch {
      await this.utilsService.deleteParticipationsBy(
        'and',
        undefined,
        eq(participationTable.gameId, gameId),
        eq(participationTable.playerId, playerId),
      );
      throw new ServiceUnavailableException('Cannot update game status.');
    }
  }

  async endGame(gameInfo: EndGameDto, gameId: number, playerId: number) {
    const participationRows:
      | { [x: string]: unknown }[]
      | participationSelect[] = await this.utilsService.findParticipationsBy(
      'and',
      undefined,
      eq(participationTable.gameId, gameId),
      eq(participationTable.playerId, playerId),
    );
    if (participationRows.length === 0)
      throw new NotFoundException('Player is not part of this game to end it.');
    const gameRows: { [x: string]: unknown }[] | gameSelect[] =
      await this.utilsService.findGamesBy(
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
        eq(gameTable.gameStatus, 'ONGOING'),
      );
    if (gameRows.length === 0)
      throw new NotFoundException(
        "Cannot end a game that hasn't started yet or is completed.",
      );
    try {
      await this.utilsService.updateGamesBy(
        {
          gameStatus: 'COMPLETED',
          totalNbMoves: gameInfo.totalNbMoves,
          winnerNbMoves: gameInfo.winnerNbMoves,
          gameResult: gameInfo.gameResult,
        } as Partial<gameInsert>,
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
      );
    } catch {
      throw new ServiceUnavailableException('Cannot end game.');
    }
    // if gameResult is draw
    if (gameInfo.gameResult === 'DRAW') {
      try {
        await this.utilsService.updateParticipationsBy(
          { playerResult: 'DRAW' } as Partial<participationInsert>,
          'and',
          undefined,
          eq(participationTable.gameId, gameId),
        );
      } catch {
        throw new ServiceUnavailableException('Cannot update participations.');
      }
      return;
    }
    // if gameResult is win, update winner participation with win and loser participation with lose
    else {
      try {
        switch (gameInfo.winnerColor) {
          case 'WHITE':
            await this.utilsService.updateParticipationsBy(
              { playerResult: 'WIN' } as Partial<participationInsert>,
              'and',
              undefined,
              eq(participationTable.gameId, gameId),
              eq(participationTable.playerColor, 'WHITE'),
            );
            await this.utilsService.updateParticipationsBy(
              { playerResult: 'LOSE' } as Partial<participationInsert>,
              'and',
              undefined,
              eq(participationTable.gameId, gameId),
              eq(participationTable.playerColor, 'BLACK'),
            );
            break;
          case 'BLACK':
            await this.utilsService.updateParticipationsBy(
              { playerResult: 'WIN' } as Partial<participationInsert>,
              'and',
              undefined,
              eq(participationTable.gameId, gameId),
              eq(participationTable.playerColor, 'BLACK'),
            );
            await this.utilsService.updateParticipationsBy(
              { playerResult: 'LOSE' } as Partial<participationInsert>,
              'and',
              undefined,
              eq(participationTable.gameId, gameId),
              eq(participationTable.playerColor, 'WHITE'),
            );
            break;
          default:
            throw new BadRequestException('Invalid winner color');
        }
      } catch {
        throw new ServiceUnavailableException(
          'Cannot update players participation.',
        );
      }
    }
  }

  async giveupGame(gameId: number, playerId: number) {
    const participationRows:
      | { [x: string]: unknown }[]
      | participationSelect[] = await this.utilsService.findParticipationsBy(
      'and',
      undefined,
      eq(participationTable.gameId, gameId),
      eq(participationTable.playerId, playerId),
    );
    if (participationRows.length === 0)
      throw new NotFoundException(
        'Player is not part of this game to give up.',
      );
    const gameRows: { [x: string]: unknown }[] | gameSelect[] =
      await this.utilsService.findGamesBy(
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
        eq(gameTable.gameStatus, 'ONGOING'),
      );
    if (gameRows.length === 0)
      throw new NotFoundException(
        "Cannot give up a game that hasn't started yet or is completed.",
      );
    try {
      await this.utilsService.updateGamesBy(
        { gameStatus: 'COMPLETED', gameResult: 'WIN' } as Partial<gameInsert>,
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
      );
    } catch {
      throw new ServiceUnavailableException('Cannot end game.');
    }
    try {
      await this.utilsService.updateParticipationsBy(
        { playerResult: 'LOSE' } as Partial<participationInsert>,
        'and',
        undefined,
        eq(participationTable.gameId, gameId),
        eq(participationTable.playerId, playerId),
      );
      await this.utilsService.updateParticipationsBy(
        { playerResult: 'WIN' } as Partial<participationInsert>,
        'and',
        undefined,
        eq(participationTable.gameId, gameId),
        ne(participationTable.playerId, playerId),
      );
    } catch {
      throw new ServiceUnavailableException(
        'Cannot update players participation.',
      );
    }
  }

  async cancelGame(gameId: number, playerId: number) {
    const participationRows:
      | { [x: string]: unknown }[]
      | participationSelect[] = await this.utilsService.findParticipationsBy(
      'and',
      undefined,
      eq(participationTable.gameId, gameId),
      eq(participationTable.playerId, playerId),
    );
    if (participationRows.length === 0)
      throw new NotFoundException(
        'Player is not part of this game to cancel it.',
      );
    const gameRows: { [x: string]: unknown }[] | gameSelect[] =
      await this.utilsService.findGamesBy(
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
        eq(gameTable.gameStatus, 'PENDING'),
      );
    if (gameRows.length === 0)
      throw new NotFoundException(
        'Cannot cancel a game that has already started or is completed.',
      );
    try {
      await this.utilsService.deleteParticipationsBy(
        'and',
        undefined,
        eq(participationTable.gameId, gameId),
        eq(participationTable.playerId, playerId),
      );
      await this.utilsService.deleteGamesBy(
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
        eq(gameTable.gameStatus, 'PENDING'),
      );
    } catch {
      throw new ServiceUnavailableException('Unable to cancel game');
    }
  }
}
