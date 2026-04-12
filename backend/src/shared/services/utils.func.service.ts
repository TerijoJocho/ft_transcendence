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
import { and, or, eq, ne, sql, SQLWrapper, desc } from 'drizzle-orm';
import { SelectedFieldsFlat, PgTable } from 'drizzle-orm/pg-core';
import { DatabaseService } from './db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  constructor(private readonly Database: DatabaseService) {}

  findAllPlayers = async (selectedValues?: SelectedFieldsFlat) => {
    const query = selectedValues
      ? this.Database.getDb().select(selectedValues).from(playerTable)
      : this.Database.getDb().select().from(playerTable);
    return query;
  };

  findPlayersBy = async (
    operator?: 'and' | 'or',
    selectedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = selectedValues
      ? this.Database.getDb().select(selectedValues).from(playerTable)
      : this.Database.getDb().select().from(playerTable);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return query;
  };

  insertPlayers = async (
    players: playerInsert[],
    insertedValues?: SelectedFieldsFlat,
  ) => {
    const query = this.Database.getDb().insert(playerTable).values(players);
    return insertedValues ? query.returning(insertedValues) : query.returning();
  };

  updateAllPlayers = async (
    updatedPlayer: Partial<playerInsert>,
    updatedValues?: SelectedFieldsFlat,
  ) => {
    const query = updatedValues
      ? this.Database.getDb()
          .update(playerTable)
          .set(updatedPlayer)
          .returning(updatedValues)
      : this.Database.getDb()
          .update(playerTable)
          .set(updatedPlayer)
          .returning();
    return query;
  };

  updatePlayersBy = async (
    updatedPlayer: Partial<playerInsert>,
    operator?: 'and' | 'or',
    updatedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb().update(playerTable).set(updatedPlayer);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return updatedValues ? query.returning(updatedValues) : query.returning();
  };

  deleteAllPlayers = async () => {
    return this.Database.getDb().delete(playerTable);
  };

  resetTable = async (table: PgTable) => {
    await this.Database.getDb().delete(table);
    await this.Database.getDb().execute(
      sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`,
    );
  };

  deletePlayersBy = async (
    operator?: 'and' | 'or',
    deletedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb().delete(playerTable);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return deletedValues ? query.returning(deletedValues) : query.returning();
  };

  //game functions
  findAllGames = async (selectedValues?: SelectedFieldsFlat) => {
    const query = selectedValues
      ? this.Database.getDb().select(selectedValues).from(gameTable)
      : this.Database.getDb().select().from(gameTable);
    return query;
  };

  findGamesBy = async (
    operator?: 'and' | 'or',
    selectedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = selectedValues
      ? this.Database.getDb().select(selectedValues).from(gameTable)
      : this.Database.getDb().select().from(gameTable);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return query;
  };

  insertGames = async (
    games: gameInsert[],
    insertedValues?: SelectedFieldsFlat,
  ) => {
    const query = this.Database.getDb().insert(gameTable).values(games);
    return insertedValues ? query.returning(insertedValues) : query.returning();
  };

  updateAllGames = async (
    updatedGame: Partial<gameInsert>,
    updatedValues?: SelectedFieldsFlat,
  ) => {
    const query = updatedValues
      ? this.Database.getDb()
          .update(gameTable)
          .set(updatedGame)
          .returning(updatedValues)
      : this.Database.getDb().update(gameTable).set(updatedGame).returning();
    return query;
  };

  updateGamesBy = async (
    updatedGame: Partial<gameInsert>,
    operator?: 'and' | 'or',
    updatedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb().update(gameTable).set(updatedGame);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return updatedValues ? query.returning(updatedValues) : query.returning();
  };

  deleteAllGames = async () => {
    return this.Database.getDb().delete(gameTable);
  };

  deleteGamesBy = async (
    operator?: 'and' | 'or',
    deletedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb().delete(gameTable);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return deletedValues ? query.returning(deletedValues) : query.returning();
  };

  //friendship functions
  findAllFriendships = async (selectedValues?: SelectedFieldsFlat) => {
    const query = selectedValues
      ? this.Database.getDb().select(selectedValues).from(friendshipTable)
      : this.Database.getDb().select().from(friendshipTable);
    return query;
  };

  findFriendshipsBy = async (
    operator?: 'and' | 'or',
    selectedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = selectedValues
      ? this.Database.getDb().select(selectedValues).from(friendshipTable)
      : this.Database.getDb().select().from(friendshipTable);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return query;
  };

  insertFriendships = async (
    friendships: friendshipInsert[],
    insertedValues?: SelectedFieldsFlat,
  ) => {
    const query = this.Database.getDb()
      .insert(friendshipTable)
      .values(friendships);
    return insertedValues ? query.returning(insertedValues) : query.returning();
  };

  updateAllFriendships = async (
    updatedFriendship: Partial<friendshipInsert>,
    updatedValues?: SelectedFieldsFlat,
  ) => {
    const query = updatedValues
      ? this.Database.getDb()
          .update(friendshipTable)
          .set(updatedFriendship)
          .returning(updatedValues)
      : this.Database.getDb()
          .update(friendshipTable)
          .set(updatedFriendship)
          .returning();
    return query;
  };

  updateFriendshipsBy = async (
    updatedFriendship: Partial<friendshipInsert>,
    operator?: 'and' | 'or',
    updatedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb()
      .update(friendshipTable)
      .set(updatedFriendship);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return updatedValues ? query.returning(updatedValues) : query.returning();
  };

  deleteAllFriendships = async () => {
    return this.Database.getDb().delete(friendshipTable);
  };

  deleteFriendshipsBy = async (
    operator?: 'and' | 'or',
    deletedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb().delete(friendshipTable);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return deletedValues ? query.returning(deletedValues) : query.returning();
  };

  //participation functions
  findAllParticipations = async (selectedValues?: SelectedFieldsFlat) => {
    const query = selectedValues
      ? this.Database.getDb().select(selectedValues).from(participationTable)
      : this.Database.getDb().select().from(participationTable);
    return query;
  };

  findParticipationsBy = async (
    operator?: 'and' | 'or',
    selectedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = selectedValues
      ? this.Database.getDb().select(selectedValues).from(participationTable)
      : this.Database.getDb().select().from(participationTable);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return query;
  };

  insertParticipations = async (
    participations: participationInsert[],
    insertedValues?: SelectedFieldsFlat,
  ) => {
    const query = this.Database.getDb()
      .insert(participationTable)
      .values(participations);
    return insertedValues ? query.returning(insertedValues) : query.returning();
  };

  updateAllParticipations = async (
    updatedParticipation: Partial<participationInsert>,
    updatedValues?: SelectedFieldsFlat,
  ) => {
    const query = updatedValues
      ? this.Database.getDb()
          .update(participationTable)
          .set(updatedParticipation)
          .returning(updatedValues)
      : this.Database.getDb()
          .update(participationTable)
          .set(updatedParticipation)
          .returning();
    return query;
  };

  updateParticipationsBy = async (
    updatedParticipation: Partial<participationInsert>,
    operator?: 'and' | 'or',
    updatedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb()
      .update(participationTable)
      .set(updatedParticipation);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return updatedValues ? query.returning(updatedValues) : query.returning();
  };

  deleteAllParticipations = async () => {
    return this.Database.getDb().delete(participationTable);
  };

  deleteParticipationsBy = async (
    operator?: 'and' | 'or',
    deletedValues?: SelectedFieldsFlat,
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb().delete(participationTable);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return deletedValues ? query.returning(deletedValues) : query.returning();
  };

  //miscellaneous functions
  // query to calculate all/some players' winrate depending on conditions  (=> [playerName, winrate])
  getWinrate = async (playerId?: number) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        winrate: sql`( COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN') + 0.5 * COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'DRAW'))
/ NULLIF(COUNT(*) FILTER (WHERE ${participationTable.playerResult} <> 'PENDING'), 0)::float`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName);
    if (playerId) {
      query = query.where(
        eq(participationTable.playerId, playerId),
      ) as typeof query;
    }
    return query;
  };

  //query to calculate average number of moves to win for a player
  getAverageWinMoves = async (playerId?: number) => {
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
    return query;
  };

  //query to find a player favourite game mode
  getFavouriteGameMode = async (playerId?: number) => {
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
      .as('mode_ranking');
    const query = this.Database.getDb()
      .select({
        playerName: subquery.playerName,
        gameMode: subquery.gameMode,
      })
      .from(subquery)
      .where(eq(subquery.ranking, 1));
    return query;
  };

  getWeeklyWinrate = async (playerId: number) => {
    const query = this.Database.getDb()
      .select({
        playerId: participationTable.playerId,
        winrate: sql<number>`(
          COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN')
          + 0.5 * COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'DRAW')
        ) / NULLIF(COUNT(*) FILTER (WHERE ${participationTable.playerResult} <> 'PENDING'), 0)::float`,
      })
      .from(participationTable)
      .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
      .where(
        and(
          eq(participationTable.playerId, playerId),
          sql`${gameTable.gameCreatedAt} >= NOW() - INTERVAL '7 days'`,
        ),
      )
      .groupBy(participationTable.playerId);
    return query;
  };

  //query to return total number of games played by a player
  getTotalGamesPlayed = async (playerId?: number) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        totalGames: sql<number>`COUNT(${participationTable.gameId})::int`,
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
    return query;
  };

  //query to return total number of wins by a player
  getTotalWins = async (playerId?: number) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        totalWins: sql<number>`COALESCE(COUNT(*), 0)::int`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName, playerTable.playerId);
    if (playerId) {
      query = query.where(
        and(
          eq(participationTable.playerId, playerId),
          eq(participationTable.playerResult, 'WIN'),
        ),
      ) as typeof query;
    } else {
      query = query.where(
        eq(participationTable.playerResult, 'WIN'),
      ) as typeof query;
    }
    return query;
  };

  //query to return total number of losses by a player
  getTotalLosses = async (playerId?: number) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        totalLosses: sql<number>`COALESCE(COUNT(*), 0)::int`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName, playerTable.playerId);
    if (playerId) {
      query = query.where(
        and(
          eq(participationTable.playerId, playerId),
          eq(participationTable.playerResult, 'LOSE'),
        ),
      ) as typeof query;
    } else {
      query = query.where(
        eq(participationTable.playerResult, 'LOSE'),
      ) as typeof query;
    }
    return query;
  };

  //query to return total number of draws by a player
  getTotalDraws = async (playerId?: number) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        totalDraws: sql<number>`COALESCE(COUNT(*), 0)::int`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName, playerTable.playerId);
    if (playerId) {
      query = query.where(
        and(
          eq(participationTable.playerId, playerId),
          eq(participationTable.playerResult, 'DRAW'),
        ),
      ) as typeof query;
    } else {
      query = query.where(
        eq(participationTable.playerResult, 'DRAW'),
      ) as typeof query;
    }
    return query;
  };

  //query to return current winstreak of all/some players
  getCurrentWinStreak = async (playerId?: number) => {
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
    return currentWinStreak;
  };

  //query to return longest winstreak of all/some players
  getLongestWinStreak = async (playerId?: number) => {
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
      .leftJoin(winningStreak, eq(playerTable.playerId, winningStreak.playerId))
      .groupBy(playerTable.playerId);
    if (playerId) {
      longestWinStreak = longestWinStreak.where(
        eq(playerTable.playerId, playerId),
      ) as typeof longestWinStreak;
    }
    return longestWinStreak;
  };

  // query to return favourite color of all/some players
  getFavouriteColor = async (playerId?: number) => {
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
    return query;
  };

  getGameHistory = async (playerId: number) => {
    const allGames = this.Database.getDb()
      .select({
        gameId: participationTable.gameId,
      })
      .from(participationTable)
      .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
      .where(eq(participationTable.playerId, playerId))
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
        gameDuration: sql<string>`${gameTable.gameCompletedAt} - ${gameTable.gameCreatedAt}`,
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
      .orderBy(desc(gameTable.gameCreatedAt));
    return query;
  };
}
