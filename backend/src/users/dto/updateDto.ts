import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  gameName?: string;

  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  mailAddress?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  pwd?: string;

  @IsString()
  @MaxLength(2048)
  @IsOptional()
  @IsUrl(
    { require_protocol: true, protocols: ['https'] },
    { message: 'avatarUrl must be a valid https URL' },
  )
  avatarUrl?: string;
}
