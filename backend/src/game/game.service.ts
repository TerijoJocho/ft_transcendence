import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
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
import { eq, ne, sql, and } from 'drizzle-orm';
import { DatabaseService } from 'src/shared/services/db.service';
import { GiveupGameDto } from './dto/giveup-game.dto';

@Injectable()
export class GameService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly databaseService: DatabaseService,
  ) {}

  private throwJoinConflict(error: unknown, message: string): never {
    throw new ConflictException(message, { cause: error });
  }

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
    try {
      const createdGameId = await this.databaseService
        .getDb()
        .transaction(async (tx) => {
          const createdNewGame = (
            await tx
              .insert(gameTable)
              .values(this.convertDtoToGameInsert(gameInfo))
              .returning()
          )[0];

          await tx
            .insert(participationTable)
            .values(
              this.convertDtoToParticipationInsert(
                gameInfo,
                playerId,
                createdNewGame.gameId,
              ),
            );

          return createdNewGame.gameId;
        });

      return { gameId: createdGameId };
    } catch (error) {
      throw new ServiceUnavailableException(error, 'Cannot create game');
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
    const participationRows = (await this.utilsService.findParticipationsBy(
      'and',
      { color: participationTable.playerColor },
      eq(participationTable.gameId, gameId),
      ne(participationTable.playerId, playerId),
    )) as { [w: string]: any }[];
    if (participationRows.length === 0)
      throw new NotFoundException('First player participation not found.');

    if (participationRows[0].color === 'WHITE')
      newGameDtoObject = { playerColor: 'BLACK' };
    else newGameDtoObject = { playerColor: 'WHITE' };

    // insert participation and update game atomically
    try {
      await this.databaseService.getDb().transaction(async (tx) => {
        await tx
          .insert(participationTable)
          .values(
            this.convertDtoToParticipationInsert(
              newGameDtoObject,
              playerId,
              gameId,
            ),
          );

        await tx
          .update(gameTable)
          .set({
            gameStatus: 'ONGOING',
            gameStartedAt: sql`NOW()` as unknown as Date,
            totalNbMoves: 0,
            winnerNbMoves: 0,
          } as Partial<gameInsert>)
          .where(eq(gameTable.gameId, gameId));
      });
    } catch (error) {
      this.throwJoinConflict(error, 'Somebody already joined this game.');
    }
  }

  async endGame(gameInfo: EndGameDto, gameId: number, playerId: number) {
    //check if player is part of the game and if game is ongoing
    const participationRows = (await this.utilsService.findParticipationsBy(
      'and',
      undefined,
      eq(participationTable.gameId, gameId),
      eq(participationTable.playerId, playerId),
    )) as participationSelect[];
    if (participationRows.length === 0) {
      throw new NotFoundException('Player is not part of this game to end it.');
    }

    const gameRows = (await this.utilsService.findGamesBy(
      'and',
      undefined,
      eq(gameTable.gameId, gameId),
      eq(gameTable.gameStatus, 'ONGOING'),
    )) as gameSelect[];
    if (gameRows.length === 0) {
      throw new NotFoundException(
        "Cannot end a game that hasn't started yet or is completed.",
      );
    }

    // update game then participations in a transaction to ensure data consistency
    await this.databaseService.getDb().transaction(async (tx) => {
      await tx
        .update(gameTable)
        .set({
          gameStatus: 'COMPLETED',
          totalNbMoves: gameInfo.totalNbMoves,
          winnerNbMoves: gameInfo.winnerNbMoves,
          gameResult: gameInfo.gameResult,
          gameCompletedAt: sql`NOW()` as unknown as Date,
        } as Partial<gameInsert>)
        .where(eq(gameTable.gameId, gameId));

      if (gameInfo.gameResult === 'DRAW') {
        await tx
          .update(participationTable)
          .set({ playerResult: 'DRAW' } as Partial<participationInsert>)
          .where(eq(participationTable.gameId, gameId));
        return;
      }

      if (gameInfo.winnerColor === 'WHITE') {
        await tx
          .update(participationTable)
          .set({ playerResult: 'WIN' } as Partial<participationInsert>)
          .where(
            and(
              eq(participationTable.gameId, gameId),
              eq(participationTable.playerColor, 'WHITE'),
            ),
          );

        await tx
          .update(participationTable)
          .set({ playerResult: 'LOSE' } as Partial<participationInsert>)
          .where(
            and(
              eq(participationTable.gameId, gameId),
              eq(participationTable.playerColor, 'BLACK'),
            ),
          );
      } else {
        await tx
          .update(participationTable)
          .set({ playerResult: 'WIN' } as Partial<participationInsert>)
          .where(
            and(
              eq(participationTable.gameId, gameId),
              eq(participationTable.playerColor, 'BLACK'),
            ),
          );

        await tx
          .update(participationTable)
          .set({ playerResult: 'LOSE' } as Partial<participationInsert>)
          .where(
            and(
              eq(participationTable.gameId, gameId),
              eq(participationTable.playerColor, 'WHITE'),
            ),
          );
      }
    });
  }

  async giveupGame(gameInfo: GiveupGameDto, gameId: number, playerId: number) {
    //check if player is part of the game and if game is ongoing
    const participationRows = (await this.utilsService.findParticipationsBy(
      'and',
      undefined,
      eq(participationTable.gameId, gameId),
      eq(participationTable.playerId, playerId),
    )) as participationSelect[];

    if (participationRows.length === 0)
      throw new NotFoundException(
        'Player is not part of this game to give up.',
      );

    const gameRows = (await this.utilsService.findGamesBy(
      'and',
      undefined,
      eq(gameTable.gameId, gameId),
      eq(gameTable.gameStatus, 'ONGOING'),
    )) as gameSelect[];
    if (gameRows.length === 0)
      throw new NotFoundException(
        "Cannot give up a game that hasn't started yet or is completed.",
      );

    // update game and participations in a transaction to keep state consistent
    await this.databaseService.getDb().transaction(async (tx) => {
      await tx
        .update(gameTable)
        .set({
          gameStatus: 'COMPLETED',
          gameResult: 'WIN',
          totalNbMoves: gameInfo.totalNbMoves,
          winnerNbMoves: gameInfo.winnerNbMoves,
          gameCompletedAt: sql`NOW()` as unknown as Date,
        } as Partial<gameInsert>)
        .where(eq(gameTable.gameId, gameId));

      await tx
        .update(participationTable)
        .set({ playerResult: 'LOSE' } as Partial<participationInsert>)
        .where(
          and(
            eq(participationTable.gameId, gameId),
            eq(participationTable.playerId, playerId),
          ),
        );

      await tx
        .update(participationTable)
        .set({ playerResult: 'WIN' } as Partial<participationInsert>)
        .where(
          and(
            eq(participationTable.gameId, gameId),
            ne(participationTable.playerId, playerId),
          ),
        );
    });
  }

  async cancelGame(gameId: number, playerId: number) {
    const participationRows = (await this.utilsService.findParticipationsBy(
      'and',
      undefined,
      eq(participationTable.gameId, gameId),
      eq(participationTable.playerId, playerId),
    )) as participationSelect[];
    if (participationRows.length === 0)
      throw new NotFoundException(
        'Player is not part of this game to cancel it.',
      );
    const gameRows = (await this.utilsService.findGamesBy(
      'and',
      undefined,
      eq(gameTable.gameId, gameId),
      eq(gameTable.gameStatus, 'PENDING'),
    )) as gameSelect[];
    if (gameRows.length === 0)
      throw new NotFoundException(
        'Cannot cancel a game that has already started or is completed.',
      );

    await this.utilsService.deleteGamesBy(
      'and',
      undefined,
      eq(gameTable.gameId, gameId),
      eq(gameTable.gameStatus, 'PENDING'),
    );
    // No need to delete participations explicitly due to cascade delete on game deletion

    // await this.utilsService.deleteParticipationsBy(
    //   'and',
    //   undefined,
    //   eq(participationTable.gameId, gameId),
    //   eq(participationTable.playerId, playerId),
    // );
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
    const pendingGamesList: { [x: string]: unknown }[] =
      await this.utilsService.getAllPendingGamesData(playerId);
    return pendingGamesList;
  }
}
