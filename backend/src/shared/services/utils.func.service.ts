import {
  player,
  playerTable,
  game,
  gameTable,
  friendship,
  friendshipTable,
  participation,
  participationTable,
} from '../db/schema';
import { and, or, eq, sql, SQLWrapper } from 'drizzle-orm';
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
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
    query = query.where(and(...flatConditions)) as typeof query;
  }
  return query;
};

insertPlayers = async (
  players: player[],
  insertedValues?: SelectedFieldsFlat,
) => {
  const query = this.Database.getDb().insert(playerTable).values(players);
  return insertedValues ? query.returning(insertedValues) : query.returning();
};

updateAllPlayers = async (
  updatedPlayer: Partial<player>,
  updatedValues?: SelectedFieldsFlat,
) => {
  const query = updatedValues
    ? this.Database.getDb().update(playerTable).set(updatedPlayer).returning(updatedValues)
    : this.Database.getDb().update(playerTable).set(updatedPlayer).returning();
  return query;
};

updatePlayersBy = async (
  updatedPlayer: Partial<player>,
  operator?: 'and' | 'or',
  updatedValues?: SelectedFieldsFlat,
  ...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  let query = this.Database.getDb().update(playerTable).set(updatedPlayer);
  const flatConditions = conditions.flat();
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
    query = query.where(and(...flatConditions)) as typeof query;
  }
  return updatedValues ? query.returning(updatedValues) : query.returning();
};

deleteAllPlayers = async () => {
  return this.Database.getDb().delete(playerTable);
};

resetTable = async (table: PgTable) => {
  await this.Database.getDb().delete(table);
  await this.Database.getDb().execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
};

deletePlayersBy = async (
  operator?: 'and' | 'or',
  deletedValues?: SelectedFieldsFlat,
  ...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  let query = this.Database.getDb().delete(playerTable);
  const flatConditions = conditions.flat();
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
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
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
    query = query.where(and(...flatConditions)) as typeof query;
  }
  return query;
};

insertGames = async (
  games: game[],
  insertedValues?: SelectedFieldsFlat,
) => {
  const query = this.Database.getDb().insert(gameTable).values(games);
  return insertedValues ? query.returning(insertedValues) : query.returning();
};

updateAllGames = async (
  updatedGame: Partial<game>,
  updatedValues?: SelectedFieldsFlat,
) => {
  const query = updatedValues
    ? this.Database.getDb().update(gameTable).set(updatedGame).returning(updatedValues)
    : this.Database.getDb().update(gameTable).set(updatedGame).returning();
  return query;
};

updateGamesBy = async (
  updatedGame: Partial<game>,
  operator?: 'and' | 'or',
  updatedValues?: SelectedFieldsFlat,
  ...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  let query = this.Database.getDb().update(gameTable).set(updatedGame);
  const flatConditions = conditions.flat();
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
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
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
    query = query.where(and(...flatConditions)) as typeof query;
  }
  return deletedValues ? query.returning(deletedValues) : query.returning();
};

//friendship functions
findAllFriendships = async (
  selectedValues?: SelectedFieldsFlat,
) => {
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
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
    query = query.where(and(...flatConditions)) as typeof query;
  }
  return query;
};

insertFriendships = async (
  friendships: friendship[],
  insertedValues?: SelectedFieldsFlat,
) => {
  const query = this.Database.getDb().insert(friendshipTable).values(friendships);
  return insertedValues ? query.returning(insertedValues) : query.returning();
};

updateAllFriendships = async (
  updatedFriendship: Partial<friendship>,
  updatedValues?: SelectedFieldsFlat,
) => {
  const query = updatedValues
    ? this.Database.getDb().update(friendshipTable).set(updatedFriendship).returning(updatedValues)
    : this.Database.getDb().update(friendshipTable).set(updatedFriendship).returning();
  return query;
};

updateFriendshipsBy = async (
  updatedFriendship: Partial<friendship>,
  operator?: 'and' | 'or',
  updatedValues?: SelectedFieldsFlat,
  ...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  let query = this.Database.getDb().update(friendshipTable).set(updatedFriendship);
  const flatConditions = conditions.flat();
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
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
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
    query = query.where(and(...flatConditions)) as typeof query;
  }
  return deletedValues ? query.returning(deletedValues) : query.returning();
};

//participation functions
findAllParticipations = async (
  selectedValues?: SelectedFieldsFlat,
) => {
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
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
    query = query.where(and(...flatConditions)) as typeof query;
  }
  return query;
};

insertParticipations = async (
  participations: participation[],
  insertedValues?: SelectedFieldsFlat,
) => {
  const query = this.Database.getDb().insert(participationTable).values(participations);
  return insertedValues ? query.returning(insertedValues) : query.returning();
};

updateAllParticipations = async (
  updatedParticipation: Partial<participation>,
  updatedValues?: SelectedFieldsFlat,
) => {
  const query = updatedValues
    ? this.Database.getDb()
        .update(participationTable)
        .set(updatedParticipation)
        .returning(updatedValues)
    : this.Database.getDb().update(participationTable).set(updatedParticipation).returning();
  return query;
};

updateParticipationsBy = async (
  updatedParticipation: Partial<participation>,
  operator?: 'and' | 'or',
  updatedValues?: SelectedFieldsFlat,
  ...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  let query = this.Database.getDb().update(participationTable).set(updatedParticipation);
  const flatConditions = conditions.flat();
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
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
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
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
      playerName: playerTable.gameName,
      winrate: sql`( COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN') + 0.5 * COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'DRAW'))
/ NULLIF(COUNT(*) FILTER (WHERE ${participationTable.playerResult} <> 'PENDING'), 0)::float`,
    })
    .from(participationTable)
    .innerJoin(
      playerTable,
      eq(participationTable.playerId, playerTable.playerId),
    )
    .groupBy(playerTable.gameName);
  const flatConditions = conditions.flat();
  if (operator === 'or') {
    query = query.where(or(...flatConditions)) as typeof query;
  } else if (operator === 'and') {
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
      playerName: playerTable.gameName,
      avgWinMoves: sql`AVG(${gameTable.winnerNbMoves})`,
    })
    .from(participationTable)
    .innerJoin(
      playerTable,
      eq(participationTable.playerId, playerTable.playerId),
    )
    .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
    .groupBy(playerTable.gameName, participationTable.playerId);
  const flatConditions = conditions.flat();
  if (operator === 'or') {
    query = query.where(
      and(eq(participationTable.playerResult, 'WIN'), or(...flatConditions)),
    ) as typeof query;
  } else if (operator === 'and') {
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
  const subquery = this.Database.getDb()
    .select({
      playerId: participationTable.playerId,
      playerName: playerTable.gameName,
      gameMode: gameTable.gameMode,
      nbGames: sql`COUNT(*)`,
      ranking: sql`RANK() OVER (PARTITION BY ${participationTable.playerId} ORDER BY COUNT(*) DESC)`,
    })
    .from(participationTable)
    .innerJoin(
      playerTable,
      eq(participationTable.playerId, playerTable.playerId),
    )
    .innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
    .groupBy(
      playerTable.gameName,
      gameTable.gameMode,
      participationTable.playerId,
    )
    .as('tmp');

  let query = this.Database.getDb()
    .select({
      playerId: subquery.playerId,
      playerName: subquery.playerName,
      gameMode: subquery.gameMode,
    })
    .from(subquery);
  const flatConditions = conditions.flat();
  if (operator === 'or') {
    query = query.where(
      and(eq(subquery.ranking, 1), or(...flatConditions)),
    ) as typeof query;
  } else if (operator === 'and') {
    query = query.where(
      and(eq(subquery.ranking, 1), and(...flatConditions)),
    ) as typeof query;
  }
  return query;
};

}
