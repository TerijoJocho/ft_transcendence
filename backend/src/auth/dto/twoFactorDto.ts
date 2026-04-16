import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class TwoFactorDto {
  @IsOptional()
  @IsString()
  readonly identifier?: string;

  @IsOptional()
  @IsString()
  readonly password?: string;

  @IsNotEmpty()
  @IsString()
  readonly reply_code!: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly redirect!: boolean;
}
