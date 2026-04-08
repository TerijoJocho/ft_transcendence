import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  timestamp,
  varchar,
  integer,
  foreignKey,
  boolean,
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
  mailAddress: varchar().notNull().unique(),
  playerName: varchar().notNull().unique(),
  pwd: varchar().notNull(),
  playerCreatedAt: timestamp().notNull().defaultNow(),
  avatarUrl: varchar()
    .notNull()
    .default(
      'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%20640%20640%22%3E%3Cpath%20d%3D%22M463%20448.2C440.9%20409.8%20399.4%20384%20352%20384L288%20384C240.6%20384%20199.1%20409.8%20177%20448.2C212.2%20487.4%20263.2%20512%20320%20512C376.8%20512%20427.8%20487.3%20463%20448.2zM64%20320C64%20178.6%20178.6%2064%20320%2064C461.4%2064%20576%20178.6%20576%20320C576%20461.4%20461.4%20576%20320%20576C178.6%20576%2064%20461.4%2064%20320zM320%20336C359.8%20336%20392%20303.8%20392%20264C392%20224.2%20359.8%20192%20320%20192C280.2%20192%20248%20224.2%20248%20264C248%20303.8%20280.2%20336%20320%20336z%22/%3E%3C/svg%3E',
    ),
});
export type playerInsert = typeof playerTable.$inferInsert;
export type playerSelect = typeof playerTable.$inferSelect;

export const gameTable = pgTable(
  'games',
  {
    gameId: integer().primaryKey().generatedAlwaysAsIdentity(),
    totalNbMoves: integer(),
    winnerNbMoves: integer(),
    gameCreatedAt: timestamp().notNull().defaultNow(),
    gameCompletedAt: timestamp(),
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
export type gameInsert = typeof gameTable.$inferInsert;
export type gameSelect = typeof gameTable.$inferSelect;

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
export type participationInsert = typeof participationTable.$inferInsert;
export type participationSelect = typeof participationTable.$inferSelect;

export const friendshipTable = pgTable(
  'friendship',
  {
    friendshipId: integer().primaryKey().generatedAlwaysAsIdentity(),
    player1Id: integer().notNull(),
    player2Id: integer().notNull(),
    friendshipStatus: friendshipStatusEnum().notNull().default('PENDING'),
    isFriend: boolean().notNull().default(false),
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
export type friendshipInsert = typeof friendshipTable.$inferInsert;
export type friendshipSelect = typeof friendshipTable.$inferSelect;
