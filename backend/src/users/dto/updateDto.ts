import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  IsUrl,
  IsStrongPassword,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(8, { message: 'pseudo must be at most 8 characters' })
  pseudo?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(30, { message: 'email must be at most 30 characters' })
  email?: string;

  @IsString()
  @IsOptional()
  @IsStrongPassword(
    {},
    {
      message:
        'newPassword must be at least 8 characters and include uppercase, lowercase, number and symbol',
    },
  )
  newPassword?: string;

  @IsString()
  @MaxLength(2048)
  @IsOptional()
  @IsUrl(
    { require_protocol: true, protocols: ['https'] },
    { message: 'avatarUrl must be a valid https URL' },
  )
  avatar?: string;
}
