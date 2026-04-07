import { IsString, IsNotEmpty } from 'class-validator';

export class deleteDto {
  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}
