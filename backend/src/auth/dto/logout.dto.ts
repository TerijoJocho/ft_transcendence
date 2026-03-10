import { IsNumber, IsNotEmpty } from 'class-validator';

export class logoutDto {
  @IsNotEmpty()
  @IsNumber()
  readonly playerId!: number;
}