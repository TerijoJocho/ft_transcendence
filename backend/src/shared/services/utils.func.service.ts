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
import { and, or, eq, sql, SQLWrapper, sum } from 'drizzle-orm';
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
  // query to calculate all/some players' winrate depending on conditions  (=> [gameName, winrate])
  getWinrate = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        winrate: sql<Number>`( COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN') + 0.5 * COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'DRAW'))
/ NULLIF(COUNT(*) FILTER (WHERE ${participationTable.playerResult} <> 'PENDING'), 0)::float`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return query;
  };

  //query to calculate average number of moves to win for all/some players
  getAverageWinMoves = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
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
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      query = query.where(
        and(eq(participationTable.playerResult, 'WIN'), or(...flatConditions)),
      ) as typeof query;
    } else if (operator === 'and' && flatConditions.length > 0) {
      query = query.where(
        and(eq(participationTable.playerResult, 'WIN'), and(...flatConditions)),
      ) as typeof query;
    }
    return query;
  };

  //query to find all/some players' favourite game mode
  getFavouriteGameMode = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let subqueryBuilder = this.Database.getDb()
      .select({
        playerId: participationTable.playerId,
        playerName: playerTable.playerName,
        gameMode: gameTable.gameMode,
        nbGames: sql<Number>`COUNT(*)::int`,
        ranking: sql<Number>`RANK() OVER (PARTITION BY ${participationTable.playerId} ORDER BY COUNT(*) DESC)`.as('ranking'),
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId));
    
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      subqueryBuilder = subqueryBuilder.where(or(...flatConditions)) as typeof subqueryBuilder;
    } else if (operator === 'and' && flatConditions.length > 0) {
      subqueryBuilder = subqueryBuilder.where(and(...flatConditions)) as typeof subqueryBuilder;
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
        playerId: subquery.playerId,
        playerName: subquery.playerName,
        gameMode: subquery.gameMode,
      })
      .from(subquery)
      .where(eq(subquery.ranking, 1));
    
    return query;
  };

  //query to return total number of games played by all/some players
  getTotalGamesPlayed = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        playerId: playerTable.playerId,
        totalGames: sql<Number>`COALESCE(COUNT(*), 0)::int`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName, playerTable.playerId);
    const flatConditions = conditions.flat();
    if (operator === 'or') {
      query = query.where(or(...flatConditions)) as typeof query;
    } else if (operator === 'and') {
      query = query.where(and(...flatConditions)) as typeof query;
    }
    return query;
  };


  //query to return total number of wins by all/some players
  getTotalWins = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        playerId: playerTable.playerId,
        totalWins: sql<Number>`COALESCE(COUNT(*), 0)::int`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName, playerTable.playerId);
    const flatConditions = conditions.flat();
    if (operator === 'or') {
      query = query.where(and(eq(participationTable.playerResult, 'WIN'), or(...flatConditions))) as typeof query;
    } else if (operator === 'and') {
      query = query.where(and(eq(participationTable.playerResult, 'WIN'), and(...flatConditions))) as typeof query;
    }
    return query;
  };

  //query to return total number of losses by all/some players
  getTotalLosses = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        playerId: playerTable.playerId,
        totalLosses: sql<Number>`COALESCE(COUNT(*), 0)::int`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName, playerTable.playerId);
    const flatConditions = conditions.flat();
    if (operator === 'or') {
      query = query.where(and(eq(participationTable.playerResult, 'LOSE'), or(...flatConditions))) as typeof query;
    } else if (operator === 'and') {
      query = query.where(and(eq(participationTable.playerResult, 'LOSE'), and(...flatConditions))) as typeof query;
    }
    return query;
  };

  //query to return total number of draws by all/some players
  getTotalDraws = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let query = this.Database.getDb()
      .select({
        playerName: playerTable.playerName,
        playerId: playerTable.playerId,
        totalDraws: sql<Number>`COALESCE(COUNT(*), 0)::int`,
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .groupBy(playerTable.playerName, playerTable.playerId);
    const flatConditions = conditions.flat();
    if (operator === 'or') {
      query = query.where(and(eq(participationTable.playerResult, 'DRAW'), or(...flatConditions))) as typeof query;
    } else if (operator === 'and') {
      query = query.where(and(eq(participationTable.playerResult, 'DRAW'), and(...flatConditions))) as typeof query;
    }
    return query;
  };

  //query to return current winstreak of all/some players
  getCurrentWinStreak = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    const orderedParticipations = this.Database.getDb()
      .select({
        playerId: participationTable.playerId,
        gameId: participationTable.gameId,
        gameDate: gameTable.gameCreatedAt,
        playerResult: participationTable.playerResult,
        sumWin: sql<Number>`SUM(CASE WHEN ${participationTable.playerResult} <> 'WIN' THEN 1 ELSE 0 END) OVER (PARTITION BY ${participationTable.playerId} ORDER BY ${gameTable.gameCreatedAt} DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)::int`.as('sumWin'),
      })
      .from(participationTable)
      .innerJoin(
        gameTable,
        eq(participationTable.gameId, gameTable.gameId),
      )
      .as('ordered_participations');
    let currentWinStreak = this.Database.getDb()
      .select({
        playerId: playerTable.playerId,
        currentStreak: sql<Number>`COALESCE(COUNT(*) FILTER (WHERE ${orderedParticipations.playerResult} = 'WIN' AND ${orderedParticipations.sumWin} = 0), 0)::int`,
      })
      .from(playerTable)
      .leftJoin(orderedParticipations, eq(playerTable.playerId, orderedParticipations.playerId))
      .groupBy(playerTable.playerId);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      currentWinStreak = currentWinStreak.where(or(...flatConditions)) as typeof currentWinStreak;
    } else if (operator === 'and' && flatConditions.length > 0) {
      currentWinStreak = currentWinStreak.where(and(...flatConditions)) as typeof currentWinStreak;
    }
    return currentWinStreak;
  };


  //query to return longest winstreak of all/some players
  getLongestWinStreak = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    const matchRowNb = this.Database.getDb()
      .select({
        playerId: participationTable.playerId,
        gameId: participationTable.gameId,
        gameDate: gameTable.gameCreatedAt,
        playerResult: participationTable.playerResult,
        rowNum: sql`ROW_NUMBER() OVER (PARTITION BY ${participationTable.playerId} ORDER BY ${gameTable.gameCreatedAt})`.as('rowNum'),
      })
      .from(participationTable)
      .innerJoin(
        gameTable,
        eq(participationTable.gameId, gameTable.gameId),
      )
      .as('match_row_num');
    const winRowNb = this.Database.getDb()
      .select({
        playerId: matchRowNb.playerId,
        groupId: sql`${matchRowNb.rowNum} - ROW_NUMBER() OVER (PARTITION BY ${matchRowNb.playerId} ORDER BY ${matchRowNb.gameDate})`.as('groupId'),
      })
      .from(matchRowNb)
      .where(eq(matchRowNb.playerResult, 'WIN'))
      .as('win_row_num');
    const winningStreak = this.Database.getDb()
      .select({
        playerId: winRowNb.playerId,
        groupId: winRowNb.groupId,
        cnt: sql<Number>`COUNT(*)::int`.as('cnt'),
      })
      .from(winRowNb)
      .groupBy(winRowNb.playerId, winRowNb.groupId)
      .as('winning_streak');
    let longestWinStreak = this.Database.getDb()
      .select({
        playerId: playerTable.playerId,
        longestStreak: sql<Number>`COALESCE(MAX(${winningStreak.cnt}), 0)::int`,
      })
      .from(playerTable)
      .leftJoin(winningStreak, eq(playerTable.playerId, winningStreak.playerId))
      .groupBy(playerTable.playerId);
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      longestWinStreak = longestWinStreak.where(or(...flatConditions)) as typeof longestWinStreak;
    } else if (operator === 'and' && flatConditions.length > 0) {
      longestWinStreak = longestWinStreak.where(and(...flatConditions)) as typeof longestWinStreak;
    }
    return longestWinStreak;
  };

  // query to return favourite color of all/some players
  getFavouriteColor = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    let colorRankingBuilder = this.Database.getDb()
      .select({
        playerId: participationTable.playerId,
        playerName: playerTable.playerName,
        playerColor: participationTable.playerColor,
        nbGames: sql<Number>`COUNT(*)::int`.as('nbGames'),
        ranking: sql<Number>`RANK() OVER (PARTITION BY ${participationTable.playerId} ORDER BY COUNT(*) DESC)`.as('ranking'),
      })
      .from(participationTable)
      .innerJoin(
        playerTable,
        eq(participationTable.playerId, playerTable.playerId),
      )
      .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId));
    
    const flatConditions = conditions.flat();
    if (operator === 'or' && flatConditions.length > 0) {
      colorRankingBuilder = colorRankingBuilder.where(or(...flatConditions)) as typeof colorRankingBuilder;
    } else if (operator === 'and' && flatConditions.length > 0) {
      colorRankingBuilder = colorRankingBuilder.where(and(...flatConditions)) as typeof colorRankingBuilder;
    }
    
    let colorRanking = colorRankingBuilder
      .groupBy(
        playerTable.playerName,
        participationTable.playerColor,
        participationTable.playerId,
      )
      .as('color_ranking');
    
    const query = this.Database.getDb()
      .select({
        playerId: colorRanking.playerId,
        playerName: colorRanking.playerName,
        playerColor: colorRanking.playerColor,
      })
      .from(colorRanking)
      .where(eq(colorRanking.ranking, 1));
    
    return query;
  };

  calculateMatchesDuration = async (
    operator?: 'and' | 'or',
    ...conditions: (SQLWrapper | SQLWrapper[])[]
  ) => {
    const query = this.Database.getDb()
      .select({
        playerId: playerTable.playerId,
        playerName: playerTable.playerName,
        gameId: gameTable.gameId,
        gameDuration: sql<Number>``
      })
  }
}