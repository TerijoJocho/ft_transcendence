import { IsNotEmpty, IsString } from 'class-validator';

export class replyDoubleFactorDto {
  @IsNotEmpty()
  @IsString()
  readonly reply_code: string;
}