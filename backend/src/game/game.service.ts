import {
  BadRequestException,
  ForbiddenException,
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
import { eq, ne, sql } from 'drizzle-orm';

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
      return { gameId: createdNewGame.gameId };
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
    const gameCheck: { [x: string]: unknown }[] | gameSelect[] =
      await this.utilsService.findGamesBy(
        'and',
        undefined,
        eq(gameTable.gameId, gameId),
        eq(gameTable.gameStatus, 'PENDING'),
      );
    if (gameCheck.length === 0)
      throw new NotFoundException('Game not found or already started.');
    //check if player is already part of the game
    const participationCheck:
      | { [x: string]: unknown }[]
      | participationSelect[] = await this.utilsService.findParticipationsBy(
      'and',
      undefined,
      eq(participationTable.gameId, gameId),
      eq(participationTable.playerId, playerId),
    );
    if (participationCheck.length > 0)
      throw new ForbiddenException('Player is already part of this game.');
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
      throw new ForbiddenException(
        'Player is not part of this game to end it.',
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
        "Cannot end a game that hasn't started yet or is completed.",
      );
    try {
      await this.utilsService.updateGamesBy(
        {
          gameStatus: 'COMPLETED',
          totalNbMoves: gameInfo.totalNbMoves,
          winnerNbMoves: gameInfo.winnerNbMoves,
          gameResult: gameInfo.gameResult,
          gameCompletedAt: sql`NOW()` as unknown as Date,
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
      throw new ForbiddenException(
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
        {
          gameStatus: 'COMPLETED',
          gameResult: 'WIN',
          gameCompletedAt: sql`NOW()` as unknown as Date,
        } as Partial<gameInsert>,
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

  async getSession(gameId: number, playerId: number) {
    const participationRows: { [x: string]: unknown }[] =
      await this.utilsService.findParticipationsBy(
        'and',
        {
          playerColor: participationTable.playerColor,
        },
        eq(participationTable.gameId, gameId),
        eq(participationTable.playerId, playerId),
      );

    if (participationRows.length === 0)
      throw new ForbiddenException('Player is not part of this game.');

    const gameRows: { [x: string]: unknown }[] =
      await this.utilsService.findGamesBy(
        'and',
        {
          gameStatus: gameTable.gameStatus,
          gameMode: gameTable.gameMode,
        },
        eq(gameTable.gameId, gameId),
      );

    if (gameRows.length === 0) throw new NotFoundException('Game not found.');

    return {
      gameId,
      playerColor: participationRows[0].playerColor,
      gameStatus: gameRows[0].gameStatus,
      gameMode: gameRows[0].gameMode,
    };
  }

  async listPendingGames(playerId: number) {
    // const pendingGamesList: { [x: string]: unknown }[] =
    //   await this.utilsService.getAllPendingGamesData(playerId);
    // return pendingGamesList;

    type PendingGameRow = Pick<
      gameSelect,
      'gameId' | 'gameMode' | 'gameCreatedAt'
    >;
    type PendingCreatorRow = Pick<
      participationSelect,
      'playerId' | 'playerColor'
    >;
    type PendingGameResponse = {
      gameId: number;
      gameMode: gameSelect['gameMode'];
      gameCreatedAt: Date;
      creatorId: number;
      creatorColor: participationSelect['playerColor'];
      createdByCurrentUser: boolean;
    };

    const pendingGames = (await this.utilsService.findGamesBy(
      'and',
      {
        gameId: gameTable.gameId,
        gameMode: gameTable.gameMode,
        gameCreatedAt: gameTable.gameCreatedAt,
      },
      eq(gameTable.gameStatus, 'PENDING'),
    )) as PendingGameRow[];

    const gamesWithCreator = await Promise.all(
      pendingGames.map(async (game): Promise<PendingGameResponse | null> => {
        const participationRows = (await this.utilsService.findParticipationsBy(
          'and',
          {
            playerId: participationTable.playerId,
            playerColor: participationTable.playerColor,
          },
          eq(participationTable.gameId, game.gameId),
        )) as PendingCreatorRow[];

        const creator = participationRows[0];
        if (!creator) return null;

        return {
          gameId: game.gameId,
          gameMode: game.gameMode,
          gameCreatedAt: game.gameCreatedAt,
          creatorId: creator.playerId,
          creatorColor: creator.playerColor,
          createdByCurrentUser: creator.playerId === playerId,
        };
      }),
    );

    return gamesWithCreator
      .filter((game): game is PendingGameResponse => game !== null)
      .sort(
        (a, b) =>
          new Date(a.gameCreatedAt).getTime() -
          new Date(b.gameCreatedAt).getTime(),
      );
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
      throw new ForbiddenException(
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
