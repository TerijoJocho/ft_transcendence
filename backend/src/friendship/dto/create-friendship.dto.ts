import { Injectable } from "@nestjs/common"
import { IsNotEmpty, IsInt, } from "class-validator";

@Injectable()
export class FriendshipDto 
{
    // @IsEmpty()
    // @IsNumber()
    // Id!: number;
    @IsInt()
    @IsNotEmpty()
    userId!: number;

    // @IsEmpty()
    // @IsNumber()
    // PlayerId2!: number;

    // @IsString()
    // @IsEmpty()
    // Status!: string;
}
