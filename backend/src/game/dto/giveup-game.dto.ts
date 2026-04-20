import { IsNumber, IsPositive } from 'class-validator';

export class GiveupGameDto {
  @IsNumber()
  @IsPositive()
  readonly totalNbMoves: number;

  @IsNumber()
  @IsPositive()
  readonly winnerNbMoves: number;
}
