import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  readonly identifier!: string;

  @IsNotEmpty()
  @IsNumber()
  readonly playerId!: number;

  @IsOptional()
  @IsString()
  readonly googleAccessToken?: string;

  @IsOptional()
  @IsString()
  readonly googleRefreshToken?: string;
}
