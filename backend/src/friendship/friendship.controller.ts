import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipDto } from './dto/create-friendship.dto';
import { PassportJwtGuard } from '../auth/guards/passport-jwt.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { LogoutDto } from '../auth/dto/logout.dto';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('add')
  @UseGuards(PassportJwtGuard)
  create(@CurrentUser() user: LogoutDto, @Body() targetId: FriendshipDto) {
    return this.friendshipService.create(user.playerId, targetId.userId);
  }

  @Delete('remove')
  @UseGuards(PassportJwtGuard)
  remove(@CurrentUser() user: LogoutDto, @Body() targetId: FriendshipDto) {
    return this.friendshipService.delete(user.playerId, targetId.userId);
  }

  @Get('get')
  @UseGuards(PassportJwtGuard)
  list(@CurrentUser() user: LogoutDto) {
    return this.friendshipService.list(user.playerId);
  }

  @Patch('changeFriendshipStatus')
  @UseGuards(PassportJwtGuard)
  changeFriendshipStatus(
    @CurrentUser() user: LogoutDto,
    @Body() targetId: FriendshipDto,
  ) {
    return this.friendshipService.changeFriendshipStatus(
      user.playerId,
      targetId.userId,
    );
  }
  // /api/user/search?username=${params.toString()} pour search
  @Get('search')
  @UseGuards(PassportJwtGuard)
  search(@CurrentUser() user: LogoutDto, @Query('username') username: string) {
    return this.friendshipService.searchUsers(user.playerId, username);
  }
}
