import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class registerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(8, { message: 'pseudo must be at most 8 characters' })
  readonly pseudo!: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(30, { message: 'email must be at most 30 characters' })
  readonly mail!: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword( {},
    {
      message:
        'newPassword must be at least 8 characters and include uppercase, lowercase, number and symbol',
    })
  readonly password!: string;

  //rajouter l url de l image de profil
  // rajouter npm install class-validator class-transformer dans le repo
}
