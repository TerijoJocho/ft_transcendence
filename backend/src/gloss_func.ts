import {
	player,
	playerTable,
	game,
	gameTable,
	friendship,
	friendshipTable,
	participation,
	participationTable,
	playerResult
} from './db/schema';
import { 
	and,
	eq,
	or,
	SelectedFields,
	SQLWrapper
} from 'drizzle-orm';
import { db } from './index';
import { 
	PgColumn,
	PgTable,
	SelectedFieldsFlat
} from 'drizzle-orm/pg-core';


export const findAllPlayers = async (selectedValues?: SelectedFieldsFlat) => {
	let query = selectedValues ? 
		db.select(selectedValues).from(playerTable) :
		db.select().from(playerTable);
	return query;
};

export const findPlayersBy = async (
	operator?: 'and' | 'or',
	selectedValues?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
		let query = selectedValues 
			? db.select(selectedValues).from(playerTable)
			: db.select().from(playerTable);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return query;
};

export const insertPlayers = async (players: player[], insertedValues?: SelectedFieldsFlat) => {
	const query = db.insert(playerTable).values(players);
	return insertedValues ? query.returning(insertedValues) : query.returning();
}

export const updateAllPlayers = async (updatedPlayer: Partial<player>, updatedValues?: SelectedFieldsFlat) => {
	const query = updatedValues ? 
		db.update(playerTable).set(updatedPlayer).returning(updatedValues) : 
		db.update(playerTable).set(updatedPlayer).returning();
	return query;
};

export const updatePlayersBy = async (
	updatedPlayer: Partial<player>, 
	operator?: 'and' | 'or',
	updatedValues ?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  		let query = db.update(playerTable).set(updatedPlayer);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return updatedValues ? query.returning(updatedValues) : query.returning();
};

export const deleteAllPlayers = async () => db.delete(playerTable);

export const deletePlayersBy = (
	operator?: 'and' | 'or',
	deletedValues ?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  		let query = db.delete(playerTable);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return deletedValues ? query.returning(deletedValues) : query.returning();
};

// similar functions for game, participation and friendship tables, to be implemented in the future when needed, following player functions as examples
export const insertGame = async (game: game, returnValue?: any) => 
	db.insert(gameTable).values(game).returning(returnValue);
export const updateAllGames = async (updatedGame: Partial<game>) => 
	db.update(gameTable).set(updatedGame).returning();
export const updateGameBy = async (column: PgColumn, value: any, updatedGame: Partial<game>) => db.update(gameTable).set(updatedGame).where(eq(column, value)).returning();
export const findGameBy = async (column: PgColumn, value: any) => db.select().from(gameTable).where(eq(column, value));
export const findAllGames = async () => db.select().from(gameTable);
export const deleteGameBy = async (column: PgColumn, value: any) => db.delete(gameTable).where(eq(column, value)).returning();
export const deleteAllGames = async () => db.delete(gameTable).returning();

export const insertFriendship = async (friendship: friendship, returnValue: any) => db.insert(friendshipTable).values(friendship).returning(returnValue);
export const findFriendshipBy = async (column: PgColumn, value: any) => db.select().from(friendshipTable).where(eq(column, value));
export const findAllFriendships = async () => db.select().from(friendshipTable);
export const updateAllFriendships = async (updatedFriendship: Partial<friendship>) => db.update(friendshipTable).set(updatedFriendship).returning();
export const updateFriendshipBy = async (column: PgColumn, value: any, updatedFriendship: Partial<friendship>) => db.update(friendshipTable).set(updatedFriendship).where(eq(column, value)).returning();
export const deleteAllFriendships = async () => db.delete(friendshipTable).returning();
export const deleteFriendshipBy = async (column: PgColumn, value: any) => db.delete(friendshipTable).where(eq(column, value)).returning();
