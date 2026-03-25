import { Injectable } from '@nestjs/common';
import { UtilsService } from '../shared/services/utils.func.service';
import { NewGameDto } from './dto/new-game.dto';
import { gameTable, gameSelect, gameInsert, participationTable, participationInsert, participationSelect, type playerColor } from 'src/shared/db/schema';
import { EndGameDto } from './dto/end-game.dto';
import { eq, ne } from 'drizzle-orm';

@Injectable()
export class GameService {
	constructor(private readonly utilsService: UtilsService) {}

	convertDtoToGameInsert(gameObject: NewGameDto): gameInsert[] {
		if (gameObject instanceof NewGameDto) {
			switch (gameObject.gameMode) {
				case 'CLASSIC':
					return [{
						gameMode: 'CLASSIC',
					}] as gameInsert[];
				case 'BLITZ':
					return [{
						gameMode: 'BLITZ',
					}] as gameInsert[];
				case 'BULLET':
					return [{
						gameMode: 'BULLET',
					}] as gameInsert[];
				default:
					throw new Error('Invalid or unprovided game mode');
			}
		}
	}

	convertDtoToParticipationInsert(gameInfo: NewGameDto, playerId: number, gameId: number): participationInsert[] {
		switch (gameInfo.playerColor) {
			case 'BLACK':
				return [{
					playerId: playerId,
					playerColor: 'BLACK',
					gameId: gameId,
				}] as participationInsert[];
			case 'WHITE':
				return [{
					playerId: playerId,
					playerColor: 'WHITE',
					gameId: gameId,
				}] as participationInsert[];
			default:
				throw new Error('Invalid participation DTO');
		}
	}

	async generateNewGame(gameInfo: NewGameDto, playerId: number) {
		const createdNewGame = (await this.utilsService.insertGames(this.convertDtoToGameInsert(gameInfo)))[0] as gameSelect;
		await this.utilsService.insertParticipations(this.convertDtoToParticipationInsert(gameInfo, playerId, createdNewGame.gameId));
	}

	async joinGame(gameId: number, playerId: number) {
		//update game status to ongoing and set totalNbMoves and winnerNbMoves to 0
		try { 
			await this.utilsService.updateGamesBy({
				gameStatus: 'ONGOING',
				totalNbMoves: 0,
				winnerNbMoves: 0,
			} as Partial<gameInsert>, "and", undefined , eq(gameTable.gameId, gameId));
		} catch {
			throw new Error("Cannot update game status.");
		}
		//create new participation for second player
		try { 
			let newGameDtoObject: NewGameDto;
			const res: {[x: string]: unknown;} = this.utilsService.findParticipationsBy('and', { color: participationTable.playerColor }, eq(participationTable.gameId, gameId), ne(participationTable.playerId, playerId))[0];
			if (res.color === 'WHITE') 
				newGameDtoObject = {
					playerColor: 'BLACK'
				};
			else
				newGameDtoObject = {
					playerColor: 'WHITE'
				};
		await this.utilsService.insertParticipations(this.convertDtoToParticipationInsert(newGameDtoObject, playerId, gameId));
		} catch {
			throw new Error("Cannot create participation for second player.");
		}
	}

	async endGame(gameInfo: EndGameDto, gameId: number, playerId: number) {
		try {
			await this.utilsService.updateGamesBy({
				gameStatus: 'COMPLETED',
				totalNbMoves: gameInfo.totalNbMoves,
				winnerNbMoves: gameInfo.winnerNbMoves,
				gameResult: gameInfo.gameResult,
			} as Partial<gameInsert>, "and", undefined , eq(gameTable.gameId, gameId));
		} catch { 
			throw new Error("Cannot end game."); 
		}
		try {
			await this.utilsService.updateParticipationsBy({
				playerResult: gameInfo.playerResult,
			} as Partial<participationInsert>, "and", undefined , eq(participationTable.gameId, gameId), eq(participationTable.playerId, playerId));
		} catch {
			throw new Error("Cannot update player 1 participation.");
		}
		try {
			switch (gameInfo.playerResult) {
				case 'WIN':
					await this.utilsService.updateParticipationsBy({
						playerResult: 'LOSE',
					} as Partial<participationInsert>, "and", undefined , eq(participationTable.gameId, gameId), ne(participationTable.playerId, playerId));
					break;
				case 'LOSE':
					await this.utilsService.updateParticipationsBy({
						playerResult: 'WIN',
					} as Partial<participationInsert>, "and", undefined , eq(participationTable.gameId, gameId), ne(participationTable.playerId, playerId));
					break;
				case 'DRAW':
					await this.utilsService.updateParticipationsBy({
						playerResult: 'DRAW',
					} as Partial<participationInsert>, "and", undefined , eq(participationTable.gameId, gameId), ne(participationTable.playerId, playerId));
					break;
				default:
					throw new Error('Invalid player result');
				}
		} catch {
			throw new Error("Cannot update player 2 participation.");
		}
	}

	async cancelGame(gameId: number, playerId: number) {
		try {
			await this.utilsService.deleteParticipationsBy('and', undefined, eq(gameTable.gameId, gameId), eq(participationTable.playerId, playerId));
			await this.utilsService.deleteGamesBy('and', undefined, eq(gameTable.gameId, gameId), eq(gameTable.gameStatus, 'PENDING'));
		} catch {
			throw new Error('Unable to cancel game');
		}
	}
}