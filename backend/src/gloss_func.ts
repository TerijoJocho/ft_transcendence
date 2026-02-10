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
import { 
	and,
	or,
	eq,
	sql,
	SQLWrapper
} from 'drizzle-orm';
import { db } from './main';
import { 
	SelectedFieldsFlat
} from 'drizzle-orm/pg-core';

//player functions
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

export const deleteAllPlayers = async () => {
	return db.delete(playerTable);
};

export const deletePlayersBy = async (
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

//game functions
export const findAllGames = async (selectedValues?: SelectedFieldsFlat) => {
	let query = selectedValues ? 
		db.select(selectedValues).from(gameTable) :
		db.select().from(gameTable);
	return query;
}

export const findGamesBy = async (
	operator?: 'and' | 'or',
	selectedValues?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
		let query = selectedValues 
			? db.select(selectedValues).from(gameTable)
			: db.select().from(gameTable);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return query;
};

export const insertGames = async (games: game[], insertedValues?: SelectedFieldsFlat) => {
	const query = db.insert(gameTable).values(games);
	return insertedValues ? query.returning(insertedValues) : query.returning();
}

export const updateAllGames = async (updatedGame: Partial<game>, updatedValues?: SelectedFieldsFlat) => {
	const query = updatedValues ? 
		db.update(gameTable).set(updatedGame).returning(updatedValues) : 
		db.update(gameTable).set(updatedGame).returning();
	return query;
};

export const updateGamesBy = async (
	updatedGame: Partial<game>, 
	operator?: 'and' | 'or',
	updatedValues ?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  		let query = db.update(gameTable).set(updatedGame);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return updatedValues ? query.returning(updatedValues) : query.returning();
};

export const deleteAllGames = async () => {
	return db.delete(gameTable);
};

export const deleteGamesBy = async (
	operator?: 'and' | 'or',
	deletedValues ?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  		let query = db.delete(gameTable);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return deletedValues ? query.returning(deletedValues) : query.returning();
};

//friendship functions
export const findAllFriendships = async (selectedValues?: SelectedFieldsFlat) => {
	let query = selectedValues ? 
		db.select(selectedValues).from(friendshipTable) :
		db.select().from(friendshipTable);
	return query;
}

export const findFriendshipsBy = async (
	operator?: 'and' | 'or',
	selectedValues?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
		let query = selectedValues 
			? db.select(selectedValues).from(friendshipTable)
			: db.select().from(friendshipTable);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return query;
};

export const insertFriendships = async (friendships: friendship[], insertedValues?: SelectedFieldsFlat) => {
	const query = db.insert(friendshipTable).values(friendships);
	return insertedValues ? query.returning(insertedValues) : query.returning();
}

export const updateAllFriendships = async (updatedFriendship: Partial<friendship>, updatedValues?: SelectedFieldsFlat) => {
	const query = updatedValues ? 
		db.update(friendshipTable).set(updatedFriendship).returning(updatedValues) : 
		db.update(friendshipTable).set(updatedFriendship).returning();
	return query;
};

export const updateFriendshipsBy = async (
	updatedFriendship: Partial<friendship>, 
	operator?: 'and' | 'or',
	updatedValues ?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  		let query = db.update(friendshipTable).set(updatedFriendship);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return updatedValues ? query.returning(updatedValues) : query.returning();
};

export const deleteAllFriendships = async () => {
	return db.delete(friendshipTable);
};

export const deleteFriendshipsBy = async (
	operator?: 'and' | 'or',
	deletedValues ?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  		let query = db.delete(friendshipTable);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return deletedValues ? query.returning(deletedValues) : query.returning();
};

//participation functions
export const findAllParticipations = async (selectedValues?: SelectedFieldsFlat) => {
	let query = selectedValues ? 
		db.select(selectedValues).from(participationTable) :
		db.select().from(participationTable);
	return query;
}

export const findParticipationsBy = async (
	operator?: 'and' | 'or',
	selectedValues?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
		let query = selectedValues 
			? db.select(selectedValues).from(participationTable)
			: db.select().from(participationTable);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return query;
};

export const insertParticipations = async (participations: participation[], insertedValues?: SelectedFieldsFlat) => {
	const query = db.insert(participationTable).values(participations);
	return insertedValues ? query.returning(insertedValues) : query.returning();
}

export const updateAllParticipations = async (updatedParticipation: Partial<participation>, updatedValues?: SelectedFieldsFlat) => {
	const query = updatedValues ? 
		db.update(participationTable).set(updatedParticipation).returning(updatedValues) : 
		db.update(participationTable).set(updatedParticipation).returning();
	return query;
};

export const updateParticipationsBy = async (
	updatedParticipation: Partial<participation>, 
	operator?: 'and' | 'or',
	updatedValues ?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  		let query = db.update(participationTable).set(updatedParticipation);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return updatedValues ? query.returning(updatedValues) : query.returning();
};

export const deleteAllParticipations = async () => {
	return db.delete(participationTable)
};

export const deleteParticipationsBy = async (
	operator?: 'and' | 'or',
	deletedValues ?: SelectedFieldsFlat,
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
  		let query = db.delete(participationTable);
		const flatConditions = conditions.flat() as SQLWrapper[];
			if (operator === 'or') {
				query = query.where(or(...flatConditions)) as typeof query;
			} else if (operator === 'and') {
      			query = query.where(and(...flatConditions)) as typeof query;
			}
		return deletedValues ? query.returning(deletedValues) : query.returning();
};

//miscellaneous functions
// query to calculate all/some players' winrate depending on conditions  (=> [gameName, winrate])
export const getWinrate = async (
	operator?: 'and' | 'or',
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
	let query = db.select({
		playerName: playerTable.gameName,
		winrate:  sql`( COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'WIN') + 0.5 * COUNT(*) FILTER (WHERE ${participationTable.playerResult} = 'DRAW'))
/ NULLIF(COUNT(*) FILTER (WHERE ${participationTable.playerResult} <> 'PENDING'), 0)::float`
		})
		.from(participationTable)
		.innerJoin(playerTable, eq(participationTable.playerId, playerTable.playerId))
		.groupBy(playerTable.gameName);
	const flatConditions = conditions.flat() as SQLWrapper[];
	if (operator === 'or') {
		query = query.where(or(...flatConditions)) as typeof query;
	} else if (operator === 'and') {
 		query = query.where(and(...flatConditions)) as typeof query;
	}
	return query;
}

//query to calculate average number of moves to win for all/some players
export const getAverageWinMoves = async (
	operator?: 'and' | 'or',
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
	let query = db.select({
	playerName: playerTable.gameName,
	avgWinMoves: sql`AVG(${gameTable.winnerNbMoves})`
	})
	.from(participationTable)
	.innerJoin(playerTable, eq(participationTable.playerId, playerTable.playerId))
	.innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
	.groupBy(playerTable.gameName)
	const flatConditions = conditions.flat() as SQLWrapper[];
	if (operator === 'or') {
		query = query.where(and(eq(participationTable.playerResult, 'WIN'), or(...flatConditions))) as typeof query;
	} else if (operator === 'and') {
 		query = query.where(and(eq(participationTable.playerResult, 'WIN'), and(...flatConditions))) as typeof query;
	}
	return query;
}

//query to find all/some players' favourite game mode
export const getFavouriteGameMode = async (
	operator?: 'and' | 'or',
	...conditions: (SQLWrapper | SQLWrapper[])[]
) => {
	const subquery = db.select({
	playerId: participationTable.playerId,
	playerName: playerTable.gameName,
	gameMode: gameTable.gameMode,
	nbGames: sql`COUNT(*)`,
	ranking: sql`RANK() OVER (PARTITION BY ${participationTable.playerId} ORDER BY COUNT(*) DESC)`
	})
	.from(participationTable)
	.innerJoin(playerTable, eq(participationTable.playerId, playerTable.playerId))
	.innerJoin(gameTable, eq(participationTable.gameId, gameTable.gameId))
	.groupBy(playerTable.gameName, gameTable.gameMode)
	.as('tmp');

	let query = db.select({
		playerId: subquery.playerId,
		playerName: subquery.playerName,
		gameMode: subquery.gameMode
	})
	.from(subquery)
	const flatConditions = conditions.flat() as SQLWrapper[];
	if (operator === 'or') {
		query = query.where(and(eq(subquery.ranking, 1), or(...flatConditions))) as typeof query;
	} else if (operator === 'and') {
 		query = query.where(and(eq(subquery.ranking, 1), and(...flatConditions))) as typeof query;
	}
	return query;
}