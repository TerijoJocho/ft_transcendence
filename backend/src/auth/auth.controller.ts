import { AuthService } from './auth.service';
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
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

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  async login(
    @CurrentUser() user: ResponseLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logIn(user, response);
  }

  @Post('refresh')
  @UseGuards(PassportJwtRefreshGuard)
  refresh(
    @CurrentUser() user: ResponseLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.authService.renewAccessToken(user, response);
  }

  @Post('logout')
  @UseGuards(PassportJwtGuard)
  async logout(
    @CurrentUser() user: LogoutDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logOut(user, response);
  }

  @Get('me')
  @UseGuards(PassportJwtGuard)
  async me(@CurrentUser() user: LogoutDto) {
    return this.authService.me(user.playerId);
  }
}
