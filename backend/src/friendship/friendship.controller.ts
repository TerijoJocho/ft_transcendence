import { Controller, Get, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipDto } from './dto/create-friendship.dto';
import { PassportJwtGuard } from 'src/auth/guards/passport-jwt.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { LogoutDto } from 'src/auth/dto/logout.dto';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('add')
  @UseGuards(PassportJwtGuard)
  create(@CurrentUser() user: LogoutDto, @Body() targetId: FriendshipDto) 
  {
    return this.friendshipService.create(user.playerId, targetId.Id);
  }

  // @Patch('update')
  // @UseGuards(PassportJwtGuard)
  // update(@CurrentUser() user: LogoutDto, @Body() targetId: FriendshipDto) 
  // {
  //   return this.friendshipService.update(user.playerId, targetId.Id);
  // }

  @Delete('remove')
  @UseGuards(PassportJwtGuard)
  remove(@CurrentUser() user: LogoutDto, @Body() targetId: FriendshipDto) 
  {
    return this.friendshipService.delete(user.playerId, targetId.Id);
  }

  @Get('get')
  @UseGuards(PassportJwtGuard)
  list(@CurrentUser() user: LogoutDto) 
  {
    return this.friendshipService.list(user.playerId);
  }

  @Patch('block')
  @UseGuards(PassportJwtGuard)
  block(@CurrentUser() user: LogoutDto, @Body() targetId: FriendshipDto) 
  {
    return this.friendshipService.blockPlayer(user.playerId, targetId.Id);
  }

  @Patch('togglefav')
  @UseGuards(PassportJwtGuard)
  toggleFav(@CurrentUser() user: LogoutDto, @Body() targetId: FriendshipDto) 
  {
    return this.friendshipService.toggleFav(user.playerId, targetId.Id);
  }
}
