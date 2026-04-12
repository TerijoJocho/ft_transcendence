import { IsString, IsNotEmpty } from 'class-validator';

export class TwoFactorDto {
  @IsNotEmpty()
  @IsString()
  readonly reply_code!: string;
}
