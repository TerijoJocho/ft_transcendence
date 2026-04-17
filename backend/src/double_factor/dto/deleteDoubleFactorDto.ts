import { IsNotEmpty, IsString } from 'class-validator';

export class deleteDoubleFactorDto {
  @IsNotEmpty()
  @IsString()
  readonly pwd: string;

  @IsNotEmpty()
  @IsString()
  readonly replyCode: string;
}
