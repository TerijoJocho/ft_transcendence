import { Injectable } from "@nestjs/common"
import { IsEmpty, IsNumber, IsString } from "class-validator";

@Injectable()
export class FriendshipDto 
{
    @IsEmpty()
    @IsNumber()
    Id!: number;

    // @IsEmpty()
    // @IsNumber()
    // PlayerId2!: number;

    // @IsString()
    // @IsEmpty()
    // Status!: string;
}
