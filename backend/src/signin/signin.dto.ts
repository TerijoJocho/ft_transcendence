import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
} from 'class-validator';

export class SigninDto {
  @IsNotEmpty()
  @IsString()
  readonly pseudo!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly mail!: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  readonly password!: string;

  //rajouter l url de l image de profil
  // rajouter npm install class-validator class-transformer dans le repo
}


