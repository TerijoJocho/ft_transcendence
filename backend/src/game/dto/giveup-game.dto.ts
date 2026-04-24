import { IsNumber } from 'class-validator';
import { IsLessThanOrEqualTo } from 'src/shared/validators/is-less-than-or-equal-to.validator';

export class GiveupGameDto {
  @IsNumber()
  readonly totalNbMoves: number;

  @IsNumber()
  @IsLessThanOrEqualTo('totalNbMoves', {
    message: 'winnerNbMoves must not be greater than totalNbMoves',
  })
  readonly winnerNbMoves: number;
}
