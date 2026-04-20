import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  ValidateIf,
} from 'class-validator';

export class EndGameDto {
  @IsNotEmpty()
  @IsIn(['WIN', 'DRAW'])
  readonly gameResult: string;

  @IsNumber()
  @IsPositive()
  readonly totalNbMoves: number;

  @IsNumber()
  @IsPositive()
  @Max(EndGameDto.prototype.totalNbMoves)
  readonly winnerNbMoves: number;

  @IsNotEmpty()
  @IsIn(['BLACK', 'WHITE'])
  @ValidateIf((object: EndGameDto) => object.gameResult === 'WIN')
  readonly winnerColor: string;
}
