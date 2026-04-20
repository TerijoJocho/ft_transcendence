import { IsNumber, IsPositive, Max } from 'class-validator';

export class GiveupGameDto {
  @IsNumber()
  @IsPositive()
  readonly totalNbMoves: number;

  @IsNumber()
  @IsPositive()
  @Max(GiveupGameDto.prototype.totalNbMoves)
  readonly winnerNbMoves: number;
}
