import  { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto 
{
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
    password?: string;
}