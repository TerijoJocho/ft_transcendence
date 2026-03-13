import { IsNumber, IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @IsNotEmpty()
  @IsNumber()
  readonly playerId!: number;
}