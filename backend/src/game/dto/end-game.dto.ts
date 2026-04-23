import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import { IsLessThanOrEqualTo } from 'src/shared/validators/is-less-than-or-equal-to.validator';

export class EndGameDto {
  @IsNotEmpty()
  @IsIn(['WIN', 'DRAW'])
  readonly gameResult: string;

  @IsNumber()
  @IsPositive()
  readonly totalNbMoves: number;

  @IsNumber()
  @IsPositive()
  @IsLessThanOrEqualTo('totalNbMoves', {
    message: 'winnerNbMoves must not be greater than totalNbMoves',
  })
  readonly winnerNbMoves: number;

  @IsNotEmpty()
  @IsIn(['BLACK', 'WHITE'])
  @ValidateIf((object: EndGameDto) => object.gameResult === 'WIN')
  readonly winnerColor: string;
}
