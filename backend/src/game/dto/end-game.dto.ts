import { IsIn, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class EndGameDto {
	@IsNumber()
	@IsPositive()
	readonly totalNbMoves: number;

	@IsNumber()
	@IsPositive()
	readonly winnerNbMoves: number;

	@IsNotEmpty()
	@IsIn(['WIN', 'DRAW'])
	readonly gameResult: string;

	@IsNotEmpty()
	@IsIn(['BLACK', 'WHITE'])
	readonly winnerColor: string;
}