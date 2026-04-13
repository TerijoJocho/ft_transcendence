import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class TwoFactorDto {
  @IsNotEmpty()
  @IsString()
  readonly reply_code!: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly redirect!: boolean;
}
