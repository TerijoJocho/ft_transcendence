import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsInt } from 'class-validator';

@Injectable()
export class FriendshipDto {
  @IsInt()
  @IsNotEmpty()
  userId!: number;
}
