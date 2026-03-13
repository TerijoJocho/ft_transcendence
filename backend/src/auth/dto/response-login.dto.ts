import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class ResponseLoginDto {
  @IsNotEmpty()
  @IsString()
  readonly identifier!: string;

  @IsNotEmpty()
  @IsNumber()
  readonly playerId!: number;
}