import { IsString, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  readonly identifier!: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  readonly password!: string;
}