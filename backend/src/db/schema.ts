import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  timestamp,
  varchar,
  integer,
  foreignKey,
  check,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const gameStatusEnum = pgEnum('game_status_enum', [
  'PENDING',
  'ONGOING',
  'COMPLETED',
]);
export type gameStatus = 'PENDING' | 'ONGOING' | 'COMPLETED';

export const gameResultEnum = pgEnum('game_result_enum', [
  'WIN',
  'DRAW',
  'PENDING',
]);
export type gameResult = 'WIN' | 'DRAW' | 'PENDING';

export const gameModeEnum = pgEnum('game_mode_enum', [
  'CLASSIC',
  'BLITZ',
  'BULLET',
]);
export type gameMode = 'CLASSIC' | 'BLITZ' | 'BULLET';

export const playerResultEnum = pgEnum('player_result_enum', [
  'PENDING',
  'WIN',
  'LOSE',
  'DRAW',
]);
export type playerResult = 'PENDING' | 'WIN' | 'LOSE' | 'DRAW';

export const playerColorEnum = pgEnum('player_color_enum', ['WHITE', 'BLACK']);
export type playerColor = 'WHITE' | 'BLACK';

export const friendshipStatusEnum = pgEnum('friendship_status_enum', [
  'PENDING',
  'ADDED',
]);
export type friendshipStatus = 'PENDING' | 'ADDED';

export const playerTable = pgTable('players', {
  playerId: integer().primaryKey().generatedAlwaysAsIdentity(),
  // sessionId: varchar().notNull().unique(),
  mailAddress: varchar().notNull().unique(),
  gameName: varchar().notNull().unique(),
  pwd: varchar().notNull(),
  avatarUrl: varchar().notNull().default('https://test.com'),
});
export type player = typeof playerTable.$inferInsert;

export const gameTable = pgTable(
  'games',
  {
    gameId: integer().primaryKey().generatedAlwaysAsIdentity(),
    totalNbMoves: integer(),
    winnerNbMoves: integer(),
    gameDate: timestamp().notNull().defaultNow(),
    gameStatus: gameStatusEnum().notNull().default('PENDING'),
    gameResult: gameResultEnum().notNull().default('PENDING'),
    gameMode: gameModeEnum().notNull(),
  },
  (pgTable) => [
    check(
      'checkmate',
      sql`${pgTable.gameStatus} <> 'COMPLETED' OR (${pgTable.totalNbMoves} IS NOT NULL AND ${pgTable.winnerNbMoves} IS NOT NULL)`,
    ),
  ],
);
export type game = typeof gameTable.$inferInsert;

export const participationTable = pgTable(
  'participation',
  {
    participationId: integer().primaryKey().generatedAlwaysAsIdentity(),
    playerId: integer().notNull(),
    gameId: integer().notNull(),
    playerResult: playerResultEnum().notNull().default('PENDING'),
    playerColor: playerColorEnum().notNull(),
  },
  (pgTable) => [
    foreignKey({
      columns: [pgTable.playerId],
      foreignColumns: [playerTable.playerId],
    })
      .onDelete('restrict')
      .onUpdate('cascade'),
    foreignKey({
      columns: [pgTable.gameId],
      foreignColumns: [gameTable.gameId],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    unique().on(pgTable.playerId, pgTable.gameId),
    unique().on(pgTable.gameId, pgTable.playerColor),
    uniqueIndex('one_current_game_only')
      .on(pgTable.playerId)
      .where(sql`${pgTable.playerResult} = 'PENDING'`),
  ],
);
export type participation = typeof participationTable.$inferInsert;

export const friendshipTable = pgTable(
  'friendship',
  {
    friendshipId: integer().primaryKey().generatedAlwaysAsIdentity(),
    player1Id: integer().notNull(),
    player2Id: integer().notNull(),
    friendshipStatus: friendshipStatusEnum().notNull().default('PENDING'),
  },
  (pgTable) => [
    foreignKey({
      columns: [pgTable.player1Id],
      foreignColumns: [playerTable.playerId],
    })
      .onDelete('restrict')
      .onUpdate('cascade'),
    foreignKey({
      columns: [pgTable.player2Id],
      foreignColumns: [playerTable.playerId],
    })
      .onDelete('restrict')
      .onUpdate('cascade'),
    unique().on(pgTable.player1Id, pgTable.player2Id),
    check(
      'no_self_friendship',
      sql`${pgTable.player1Id} <> ${pgTable.player2Id}`,
    ),
    check(
      'ordered_player_ids',
      sql`${pgTable.player1Id} < ${pgTable.player2Id}`,
    ),
  ],
);
export type friendship = typeof friendshipTable.$inferInsert;
