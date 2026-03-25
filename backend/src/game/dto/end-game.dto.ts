import { IsIn, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class EndGameDto {
	@IsNumber()
	@IsPositive()
	readonly totalNbMoves: number;

	@IsNumber()
	@IsPositive()
	readonly winnerNbMoves: number;

	// @IsNotEmpty()
	// @IsEqual('COMPLETED')
	// readonly gameStatus: string;

	@IsNotEmpty()
	@IsIn(['WIN', 'DRAW'])
	readonly gameResult: string;

	@IsNotEmpty()
	@IsIn(['WIN', 'LOSE', 'DRAW'])
	readonly playerResult: string;
}