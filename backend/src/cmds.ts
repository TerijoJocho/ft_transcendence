import {
	player,
	playerTable,
	game,
	gameTable,
	friendship,
	friendshipTable,
	participation,
	participationTable
} from './db/schema';
import { eq, or } from 'drizzle-orm';
import { db } from './index';
import { PgColumn } from 'drizzle-orm/pg-core';

export const insertPlayer = async (player: player, insertedValues?: any) => db.insert(playerTable).values(player).returning(insertedValues);

export const updatePlayerBy = async (
	updatedPlayer: Partial<player>, 
	operator: 'and' | 'or',
	insertedValues?: any, 
	...conditions: [PgColumn, any][]
) => {
  		let query = db.update(playerTable).set(updatedPlayer);
		if (conditions.length > 0) {
			if (operator === 'or') {
				const orConditions = conditions.map(([col, val]) => eq(col, val));
				query = query.where(or(...orConditions)) as typeof query;
			} else {
				conditions.forEach(([col, val]) => {
      				query = query.where(eq(col, val)) as typeof query;
    			});
			}
		}
		return insertedValues ? query.returning(insertedValues) : query.returning();
};

export const findPlayerBy = async (column: PgColumn, value: any) => db.select().from(playerTable).where(eq(column, value));
export const findAllPlayers = async () => db.select().from(playerTable);
export const deletePlayerBy = async (column: PgColumn, value: any) => db.delete(playerTable).where(eq(column, value)).returning();
export const deleteAllPlayers = async () => db.delete(playerTable);

export const insertGame = async (game: game, returnValue: any) => db.insert(gameTable).values(game).returning(returnValue);
export const updateGameBy = async (column: PgColumn, value: any, updatedGame: Partial<game>) => db.update(gameTable).set(updatedGame).where(eq(column, value)).returning();
export const findGameBy = async (column: PgColumn, value: any) => db.select().from(gameTable).where(eq(column, value));
export const findAllGames = async () => db.select().from(gameTable);
export const deleteGameBy = async (column: PgColumn, value: any) => db.delete(gameTable).where(eq(column, value)).returning();
export const deleteAllGames = async () => db.delete(gameTable).returning();

export const insertFriendship = async (friendship: friendship, returnValue: any) => db.insert(friendshipTable).values(friendship).returning(returnValue);
export const updateFriendshipBy = async (column: PgColumn, value: any, updatedFriendship: Partial<friendship>) => db.update(friendshipTable).set(updatedFriendship).where(eq(column, value)).returning();