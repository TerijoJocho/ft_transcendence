import {
  Controller,
  Delete,
  Res,
  Patch,
  Body,
  UseGuards,
  Get,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateDto';
import { PassportJwtGuard } from 'src/auth/guards/passport-jwt.guard';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import type { Response } from 'express';
import { registerDto } from './dto/user_dto';

@Controller('users')
export class UsersController {
  constructor(private readonly UserService: UserService) {}

  @Post('register')
  register(@Body() bodyDto: registerDto) {
    return this.UserService.registerPlayers(
      bodyDto.mail,
      bodyDto.pseudo,
      bodyDto.password,
    );
  }

  @Get('me')
  @UseGuards(PassportJwtGuard)
  getDataUser(@CurrentUser() user: { playerId: number }) {
    const playerId = user.playerId;
    return this.UserService.getDataUser(playerId);
  }

  @UseGuards(PassportJwtGuard)
  @Delete('delete')
  deleteUser(
    @CurrentUser() user: { playerId: number },
    @Res() response: Response,
  ) {
    return this.UserService.deleteUserbyId(user.playerId, response);
  }

  @UseGuards(PassportJwtGuard)
  @Patch('update')
  async updateData(
    @CurrentUser() user: { playerId: number },
    @Body() Data: UpdateUserDto,
  ) {
    const playerId = user.playerId;
    const result = await this.UserService.updateUserData(playerId, Data);
    return { message: result };
  }
}
