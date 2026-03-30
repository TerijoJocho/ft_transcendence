import { AuthService } from './auth.service';
import { Controller, Post, Res, UseGuards, Get } from '@nestjs/common';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { PassportJwtGuard } from './guards/passport-jwt.guard';
import type { Response } from 'express';
import { CurrentUser } from './decorator/current-user.decorator';
import { ResponseLoginDto } from './dto/response-login.dto';
import { LogoutDto } from './dto/logout.dto';
import { PassportJwtRefreshGuard } from './guards/passport-jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(PassportLocalGuard)
  login(@CurrentUser() user: ResponseLoginDto, @Res() response: Response) {
    return this.authService.logIn(user, response);
  }

  @Post('refresh')
  @UseGuards(PassportJwtRefreshGuard)
  refresh(@CurrentUser() user: ResponseLoginDto, @Res() response: Response) {
    return this.authService.renewAccessToken(user, response);
  }

  @Post('logout')
  @UseGuards(PassportJwtGuard)
  logout(@CurrentUser() user: LogoutDto, @Res() response: Response) {
    return this.authService.logOut(user, response);
  }

  @Get('me')
  @UseGuards(PassportJwtGuard)
  async me(@CurrentUser() user: LogoutDto) {
    return this.authService.me(user.playerId);
  }
}
