import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDoubleFactorDto {
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;
}
