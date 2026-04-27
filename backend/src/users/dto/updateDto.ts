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
  pseudo?: string;

  @IsEmail()
  @IsOptional()
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
