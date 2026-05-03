import {
  playerInsert,
  playerTable,
  gameInsert,
  gameTable,
  friendshipInsert,
  friendshipTable,
  participationInsert,
  participationTable,
} from '../db/schema';
import { and, or, eq, ne, sql, SQLWrapper, desc, gte, lt } from 'drizzle-orm';
import { SelectedFieldsFlat, PgTable } from 'drizzle-orm/pg-core';
import { DatabaseService } from './db.service';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class UtilsService {
  constructor(private readonly Database: DatabaseService) {}

  private throwDbUnavailable(error: unknown, message: string): never {
    throw new ServiceUnavailableException(message, { cause: error });
  }

  findAllPlayers = async (selectedValues?: SelectedFieldsFlat) => {
    try {
      const query = selectedValues
        ? this.Database.getDb().select(selectedValues).from(playerTable)
        : this.Database.getDb().select().from(playerTable);
      return await query;
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during player selection.');
    }
  };

  findPlayersBy = async (
    operator?: 'and' | 'or',
    selectedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = selectedValues
        ? this.Database.getDb().select(selectedValues).from(playerTable)
        : this.Database.getDb().select().from(playerTable);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return await query;
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during player selection.');
    }
  };

  insertPlayers = async (
    players: playerInsert[],
    insertedValues?: SelectedFieldsFlat,
  ) => {
    try {
      const query = this.Database.getDb().insert(playerTable).values(players);
      return insertedValues
        ? await query.returning(insertedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during player insertion.');
    }
  };

  updateAllPlayers = async (
    updatedPlayer: Partial<playerInsert>,
    updatedValues?: SelectedFieldsFlat,
  ) => {
    try {
      const query = updatedValues
        ? this.Database.getDb()
            .update(playerTable)
            .set(updatedPlayer)
            .returning(updatedValues)
        : this.Database.getDb()
            .update(playerTable)
            .set(updatedPlayer)
            .returning();
      return await query;
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during player update.');
    }
  };

  updatePlayersBy = async (
    updatedPlayer: Partial<playerInsert>,
    operator?: 'and' | 'or',
    updatedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = this.Database.getDb().update(playerTable).set(updatedPlayer);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return updatedValues
        ? await query.returning(updatedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during player update.');
    }
  };

  deleteAllPlayers = async () => {
    try {
      return await this.Database.getDb().delete(playerTable);
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during player deletion.');
    }
  };

  resetTable = async (table: PgTable) => {
    try {
      await this.Database.getDb().delete(table);
      await this.Database.getDb().execute(
        sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`,
      );
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during table reset.');
    }
  };

  deletePlayersBy = async (
    operator?: 'and' | 'or',
    deletedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = this.Database.getDb().delete(playerTable);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return deletedValues
        ? await query.returning(deletedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during player deletion.');
    }
  };

  //game functions
  findAllGames = async (selectedValues?: SelectedFieldsFlat) => {
    try {
      const query = selectedValues
        ? this.Database.getDb().select(selectedValues).from(gameTable)
        : this.Database.getDb().select().from(gameTable);
      return await query;
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during game selection.');
    }
  };

  findGamesBy = async (
    operator?: 'and' | 'or',
    selectedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = selectedValues
        ? this.Database.getDb().select(selectedValues).from(gameTable)
        : this.Database.getDb().select().from(gameTable);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return await query;
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during game selection.');
    }
  };

  insertGames = async (
    games: gameInsert[],
    insertedValues?: SelectedFieldsFlat,
  ) => {
    try {
      const query = this.Database.getDb().insert(gameTable).values(games);
      return insertedValues
        ? await query.returning(insertedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during game insertion.');
    }
  };

  updateAllGames = async (
    updatedGame: Partial<gameInsert>,
    updatedValues?: SelectedFieldsFlat,
  ) => {
    try {
      const query = updatedValues
        ? this.Database.getDb()
            .update(gameTable)
            .set(updatedGame)
            .returning(updatedValues)
        : this.Database.getDb().update(gameTable).set(updatedGame).returning();
      return await query;
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during game update.');
    }
  };

  updateGamesBy = async (
    updatedGame: Partial<gameInsert>,
    operator?: 'and' | 'or',
    updatedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = this.Database.getDb().update(gameTable).set(updatedGame);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return updatedValues
        ? await query.returning(updatedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during game update.');
    }
  };

  deleteAllGames = async () => {
    try {
      return await this.Database.getDb().delete(gameTable);
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during game deletion.');
    }
  };

  deleteGamesBy = async (
    operator?: 'and' | 'or',
    deletedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = this.Database.getDb().delete(gameTable);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return deletedValues
        ? await query.returning(deletedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(error, 'Database error during game deletion.');
    }
  };

  //friendship functions
  findAllFriendships = async (selectedValues?: SelectedFieldsFlat) => {
    try {
      const query = selectedValues
        ? this.Database.getDb().select(selectedValues).from(friendshipTable)
        : this.Database.getDb().select().from(friendshipTable);
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during friendship retrieval.',
      );
    }
  };

  findFriendshipsBy = async (
    operator?: 'and' | 'or',
    selectedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = selectedValues
        ? this.Database.getDb().select(selectedValues).from(friendshipTable)
        : this.Database.getDb().select().from(friendshipTable);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during friendship retrieval.',
      );
    }
  };

  insertFriendships = async (
    friendships: friendshipInsert[],
    insertedValues?: SelectedFieldsFlat,
  ) => {
    try {
      const query = this.Database.getDb()
        .insert(friendshipTable)
        .values(friendships);
      return insertedValues
        ? await query.returning(insertedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during friendship insertion.',
      );
    }
  };

  updateAllFriendships = async (
    updatedFriendship: Partial<friendshipInsert>,
    updatedValues?: SelectedFieldsFlat,
  ) => {
    try {
      const query = updatedValues
        ? this.Database.getDb()
            .update(friendshipTable)
            .set(updatedFriendship)
            .returning(updatedValues)
        : this.Database.getDb()
            .update(friendshipTable)
            .set(updatedFriendship)
            .returning();
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during friendship update.',
      );
    }
  };

  updateFriendshipsBy = async (
    updatedFriendship: Partial<friendshipInsert>,
    operator?: 'and' | 'or',
    updatedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = this.Database.getDb()
        .update(friendshipTable)
        .set(updatedFriendship);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return updatedValues
        ? await query.returning(updatedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during friendship update.',
      );
    }
  };

  deleteAllFriendships = async () => {
    try {
      return await this.Database.getDb().delete(friendshipTable);
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during friendship deletion.',
      );
    }
  };

  deleteFriendshipsBy = async (
    operator?: 'and' | 'or',
    deletedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = this.Database.getDb().delete(friendshipTable);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return deletedValues
        ? await query.returning(deletedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during friendship deletion.',
      );
    }
  };

  //participation functions
  findAllParticipations = async (selectedValues?: SelectedFieldsFlat) => {
    try {
      const query = selectedValues
        ? this.Database.getDb().select(selectedValues).from(participationTable)
        : this.Database.getDb().select().from(participationTable);
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during participation retrieval.',
      );
    }
  };

  findParticipationsBy = async (
    operator?: 'and' | 'or',
    selectedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = selectedValues
        ? this.Database.getDb().select(selectedValues).from(participationTable)
        : this.Database.getDb().select().from(participationTable);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during participation retrieval.',
      );
    }
  };

  insertParticipations = async (
    participations: participationInsert[],
    insertedValues?: SelectedFieldsFlat,
  ) => {
    try {
      const query = this.Database.getDb()
        .insert(participationTable)
        .values(participations);
      return insertedValues
        ? await query.returning(insertedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during participation insertion.',
      );
    }
  };

  updateAllParticipations = async (
    updatedParticipation: Partial<participationInsert>,
    updatedValues?: SelectedFieldsFlat,
  ) => {
    try {
      const query = updatedValues
        ? this.Database.getDb()
            .update(participationTable)
            .set(updatedParticipation)
            .returning(updatedValues)
        : this.Database.getDb()
            .update(participationTable)
            .set(updatedParticipation)
            .returning();
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during participation update.',
      );
    }
  };

  updateParticipationsBy = async (
    updatedParticipation: Partial<participationInsert>,
    operator?: 'and' | 'or',
    updatedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = this.Database.getDb()
        .update(participationTable)
        .set(updatedParticipation);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return updatedValues
        ? await query.returning(updatedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during participation update.',
      );
    }
  };

  deleteAllParticipations = async () => {
    try {
      return await this.Database.getDb().delete(participationTable);
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during participation deletion.',
      );
    }
  };

  deleteParticipationsBy = async (
    operator?: 'and' | 'or',
    deletedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    try {
      let query = this.Database.getDb().delete(participationTable);
      const flatConditions = conditions.flat();
      if (operator === 'or' && flatConditions.length > 0) {
        query = query.where(or(...flatConditions)) as typeof query;
      } else if (operator === 'and' && flatConditions.length > 0) {
        query = query.where(and(...flatConditions)) as typeof query;
      }
      return deletedValues
        ? await query.returning(deletedValues)
        : await query.returning();
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during participation deletion.',
      );
    }
  };

  //miscellaneous functions
  //query to calculate average number of moves to win for a player
  getAverageWinMoves = async (playerId?: number) => {
    try {
      let query = this.Database.getDb()
        .select({
          playerName: playerTable.playerName,
          avgWinMoves: sql`AVG(${gameTable.winnerNbMoves})`,
        })
        .from(participationTable)
        .innerJoin(
          playerTable,
          eq(participationTable.playerId, playerTable.playerId),
        )
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
        .groupBy(playerTable.playerName, participationTable.playerId);
      if (playerId) {
        query = query.where(
          and(
            eq(participationTable.playerResult, 'WIN'),
            eq(participationTable.playerId, playerId),
          ),
        ) as typeof query;
      }
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during average win moves calculation.',
      );
    }
  };

  //query to find a player favourite game mode
  getFavouriteGameMode = async (playerId?: number) => {
    try {
      let subqueryBuilder = this.Database.getDb()
        .select({
          playerName: playerTable.playerName,
          gameMode: gameTable.gameMode,
          nbGames: sql<number>`COUNT(*)::int`,
          ranking:
            sql<number>`RANK() OVER (PARTITION BY ${participationTable.playerId} ORDER BY COUNT(*) DESC)`.as(
              'ranking',
            ),
        })
        .from(participationTable)
        .innerJoin(
          playerTable,
          eq(participationTable.playerId, playerTable.playerId),
        )
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId));
      if (playerId) {
        subqueryBuilder = subqueryBuilder.where(
          eq(participationTable.playerId, playerId),
        ) as typeof subqueryBuilder;
      }
      const subquery = subqueryBuilder
        .groupBy(
          playerTable.playerName,
          gameTable.gameMode,
          participationTable.playerId,
        )
        .as('tmp');

      const query = this.Database.getDb()
        .select({
          playerName: subquery.playerName,
          gameMode: subquery.gameMode,
        })
        .from(subquery)
        .where(eq(subquery.ranking, 1));

      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during favourite game mode retrieval.',
      );
    }
  };

  //query to return total number of games, nb of wins, loss and draws for a player
  getGamesResCounts = async (playerId?: number) => {
    try {
      let query = this.Database.getDb()
        .select({
          playerName: playerTable.playerName,
          winRate: sql<number>`( COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN') + 0.5 * COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'DRAW')) / NULLIF(COUNT(*) FILTER (WHERE ${participationTable.playerResult} <> 'PENDING'), 0)::float`,
          totalGames: sql<number>`COUNT(${participationTable.gameId})::int`,
          totalWins: sql<number>`COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN')::int`,
          totalLosses: sql<number>`COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'LOSE')::int`,
          totalDraws: sql<number>`COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'DRAW')::int`,
        })
        .from(playerTable)
        .leftJoin(
          participationTable,
          eq(participationTable.playerId, playerTable.playerId),
        )
        .groupBy(playerTable.playerName, playerTable.playerId);
      if (playerId) {
        query = query.where(eq(playerTable.playerId, playerId)) as typeof query;
      }
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during games results count retrieval.',
      );
    }
  };

  //query to return current winstreak of all/some players
  getCurrentWinStreak = async (playerId?: number) => {
    try {
      const orderedParticipations = this.Database.getDb()
        .select({
          playerId: participationTable.playerId,
          gameId: participationTable.gameId,
          gameDate: gameTable.gameCreatedAt,
          playerResult: participationTable.playerResult,
          sumWin:
            sql<number>`SUM(CASE WHEN ${participationTable.playerResult} <> 'WIN' THEN 1 ELSE 0 END) OVER (PARTITION BY ${participationTable.playerId} ORDER BY ${gameTable.gameCreatedAt} DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)::int`.as(
              'sumWin',
            ),
        })
        .from(participationTable)
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
        .as('ordered_participations');
      let currentWinStreak = this.Database.getDb()
        .select({
          playerId: playerTable.playerId,
          currentStreak: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${orderedParticipations.playerResult} = 'WIN' AND ${orderedParticipations.sumWin} = 0), 0)::int`,
        })
        .from(playerTable)
        .leftJoin(
          orderedParticipations,
          eq(playerTable.playerId, orderedParticipations.playerId),
        )
        .groupBy(playerTable.playerId);
      if (playerId) {
        currentWinStreak = currentWinStreak.where(
          eq(playerTable.playerId, playerId),
        ) as typeof currentWinStreak;
      }
      return await currentWinStreak;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during current win streak retrieval.',
      );
    }
  };

  //query to return longest winstreak of all/some players
  getLongestWinStreak = async (playerId?: number) => {
    try {
      const matchRowNb = this.Database.getDb()
        .select({
          playerId: participationTable.playerId,
          gameId: participationTable.gameId,
          gameDate: gameTable.gameCreatedAt,
          playerResult: participationTable.playerResult,
          rowNum:
            sql`ROW_NUMBER() OVER (PARTITION BY ${participationTable.playerId} ORDER BY ${gameTable.gameCreatedAt})`.as(
              'rowNum',
            ),
        })
        .from(participationTable)
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
        .as('match_row_num');
      const winRowNb = this.Database.getDb()
        .select({
          playerId: matchRowNb.playerId,
          groupId:
            sql`${matchRowNb.rowNum} - ROW_NUMBER() OVER (PARTITION BY ${matchRowNb.playerId} ORDER BY ${matchRowNb.gameDate})`.as(
              'groupId',
            ),
        })
        .from(matchRowNb)
        .where(eq(matchRowNb.playerResult, 'WIN'))
        .as('win_row_num');
      const winningStreak = this.Database.getDb()
        .select({
          playerId: winRowNb.playerId,
          groupId: winRowNb.groupId,
          cnt: sql<number>`COUNT(*)::int`.as('cnt'),
        })
        .from(winRowNb)
        .groupBy(winRowNb.playerId, winRowNb.groupId)
        .as('winning_streak');
      let longestWinStreak = this.Database.getDb()
        .select({
          playerId: playerTable.playerId,
          longestStreak: sql<number>`COALESCE(MAX(${winningStreak.cnt}), 0)::int`,
        })
        .from(playerTable)
        .leftJoin(
          winningStreak,
          eq(playerTable.playerId, winningStreak.playerId),
        )
        .groupBy(playerTable.playerId);
      if (playerId) {
        longestWinStreak = longestWinStreak.where(
          eq(playerTable.playerId, playerId),
        ) as typeof longestWinStreak;
      }
      return await longestWinStreak;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during longest win streak retrieval.',
      );
    }
  };

  // query to return favourite color of all/some players
  getFavouriteColor = async (playerId?: number) => {
    try {
      let colorRankingBuilder = this.Database.getDb()
        .select({
          playerId: participationTable.playerId,
          playerName: playerTable.playerName,
          playerColor: participationTable.playerColor,
          nbGames: sql<number>`COUNT(*)::int`.as('nbGames'),
          ranking:
            sql<number>`RANK() OVER (PARTITION BY ${participationTable.playerId} ORDER BY COUNT(*) DESC)`.as(
              'ranking',
            ),
        })
        .from(participationTable)
        .innerJoin(
          playerTable,
          eq(participationTable.playerId, playerTable.playerId),
        )
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId));
      if (playerId) {
        colorRankingBuilder = colorRankingBuilder.where(
          eq(playerTable.playerId, playerId),
        ) as typeof colorRankingBuilder;
      }
      const colorRanking = colorRankingBuilder
        .groupBy(
          playerTable.playerName,
          participationTable.playerColor,
          participationTable.playerId,
        )
        .as('color_ranking');
      const query = this.Database.getDb()
        .select({
          playerName: colorRanking.playerName,
          playerColor: colorRanking.playerColor,
        })
        .from(colorRanking)
        .where(eq(colorRanking.ranking, 1));
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during favourite color retrieval.',
      );
    }
  };

  getGameHistory = async (playerId: number, nb: number) => {
    try {
      const allGames = this.Database.getDb()
        .select({
          gameId: participationTable.gameId,
        })
        .from(participationTable)
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
        .where(eq(participationTable.playerId, playerId))
        .limit(nb)
        .orderBy(desc(gameTable.gameCreatedAt))
        .as('all_games');
      const opponentsNamesQuery = this.Database.getDb()
        .select({
          opponentsName: playerTable.playerName,
          gameId: allGames.gameId,
        })
        .from(participationTable)
        .innerJoin(
          playerTable,
          eq(participationTable.playerId, playerTable.playerId),
        )
        .innerJoin(allGames, eq(participationTable.gameId, allGames.gameId))
        .where(ne(participationTable.playerId, playerId))
        .as('opponents_names');
      const query = this.Database.getDb()
        .select({
          gameId: gameTable.gameId,
          gameMode: gameTable.gameMode,
          playerColor: participationTable.playerColor,
          playerResult: participationTable.playerResult,
          opponentName: opponentsNamesQuery.opponentsName,
          gameDuration: sql<string>`${gameTable.gameCompletedAt} - ${gameTable.gameStartedAt}`,
        })
        .from(participationTable)
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
        .innerJoin(
          playerTable,
          eq(participationTable.playerId, playerTable.playerId),
        )
        .leftJoin(
          opponentsNamesQuery,
          eq(opponentsNamesQuery.gameId, gameTable.gameId),
        )
        .where(eq(participationTable.playerId, playerId))
        .orderBy(desc(gameTable.gameStartedAt));
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during game history retrieval.',
      );
    }
  };

  getWeeklyWinrate = async (playerId: number) => {
    try {
      const currentWeekStart = new Date();
      currentWeekStart.setUTCHours(0, 0, 0, 0);
      currentWeekStart.setUTCDate(
        currentWeekStart.getUTCDate() -
          ((currentWeekStart.getUTCDay() + 6) % 7),
      );
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);

      const weeklyRows = await this.Database.getDb()
        .select({
          dayDate:
            sql<string>`DATE_TRUNC('day', ${gameTable.gameStartedAt})::date`.as(
              'dayDate',
            ),
          wins: sql<number>`COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN')::int`.as(
            'wins',
          ),
          games:
            sql<number>`COUNT(*) FILTER (WHERE ${participationTable.playerResult} <> 'PENDING')::int`.as(
              'games',
            ),
        })
        .from(participationTable)
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
        .where(
          and(
            eq(participationTable.playerId, playerId),
            gte(gameTable.gameStartedAt, currentWeekStart),
            lt(gameTable.gameStartedAt, nextWeekStart),
          ),
        )
        .groupBy(sql`DATE_TRUNC('day', ${gameTable.gameStartedAt})`)
        .orderBy(sql`DATE_TRUNC('day', ${gameTable.gameStartedAt})`);

      const byDate = new Map<string, { wins: number; games: number }>();
      for (const row of weeklyRows) {
        const dateIso = row.dayDate.slice(0, 10);
        byDate.set(dateIso, { wins: row.wins, games: row.games });
      }

      let cumulativeWins = 0;
      let cumulativeGames = 0;
      const points: { dayIndex: number; date: string; winrate: number }[] = [];
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setUTCDate(currentWeekStart.getUTCDate() + i);
        const dateIso = date.toISOString().slice(0, 10);
        const stats = byDate.get(dateIso) ?? { wins: 0, games: 0 };
        cumulativeWins += stats.wins;
        cumulativeGames += stats.games;

        if (date > today) {
          const winrate = 0;
          points.push({ dayIndex: i + 1, date: dateIso, winrate });
        } else {
          const winrate =
            cumulativeGames === 0
              ? 0
              : Number(((cumulativeWins * 100) / cumulativeGames).toFixed(2));

          points.push({ dayIndex: i + 1, date: dateIso, winrate });
        }
      }

      return {
        timezone: 'UTC',
        weekStart: currentWeekStart.toISOString().slice(0, 10),
        points,
      };
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during weekly winrate retrieval.',
      );
    }
  };

  getAllPendingGamesData = async (playerId: number) => {
    try {
      const query = this.Database.getDb()
        .select({
          gameId: gameTable.gameId,
          gameMode: gameTable.gameMode,
          creatorName: playerTable.playerName,
          creatorId: playerTable.playerId,
          creatorColor: participationTable.playerColor,
          gameCreatedAt: gameTable.gameCreatedAt,
        })
        .from(gameTable)
        .innerJoin(
          participationTable,
          eq(participationTable.gameId, gameTable.gameId),
        )
        .innerJoin(
          playerTable,
          eq(participationTable.playerId, playerTable.playerId),
        )
        .where(
          and(
            eq(gameTable.gameStatus, 'PENDING'),
            ne(participationTable.playerId, playerId),
          ),
        )
        .orderBy(desc(gameTable.gameCreatedAt));
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during pending games retrieval.',
      );
    }
  };

  getLeaderboard = async () => {
    try {
      const playerLevel =
        sql<number>`COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN')::int`.as(
          'playerLevel',
        );
      const query = this.Database.getDb()
        .select({
          playerId: playerTable.playerId,
          playerName: playerTable.playerName,
          playerLevel,
        })
        .from(playerTable)
        .leftJoin(
          participationTable,
          eq(participationTable.playerId, playerTable.playerId),
        )
        .groupBy(playerTable.playerId, playerTable.playerName);

      const leaderboard = await query.orderBy(desc(playerLevel));
      return leaderboard;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during leaderboard retrieval.',
      );
    }
  };

  getAllOngoingGamesData = async (playerId: number) => {
    try {
      const query = this.Database.getDb()
        .select({
          gameId: gameTable.gameId,
          gameMode: gameTable.gameMode,
          gameStatus: gameTable.gameStatus,
          playerColor: participationTable.playerColor,
        })
        .from(participationTable)
        .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
        .where(
          and(
            eq(participationTable.playerId, playerId),
            eq(gameTable.gameStatus, 'ONGOING'),
            eq(participationTable.playerResult, 'PENDING'),
          ),
        )
        .orderBy(desc(gameTable.gameCreatedAt));
      return await query;
    } catch (error) {
      this.throwDbUnavailable(
        error,
        'Database error during ongoing games retrieval.',
      );
    }
  };
}
