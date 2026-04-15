import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDoubleFactorDto {
  @IsNotEmpty()
  @IsNumber()
  readonly playerId: number;
}
