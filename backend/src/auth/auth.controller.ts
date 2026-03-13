import { AuthService } from './auth.service';
import { Controller, Get, HttpCode, HttpStatus, Post, Request, Res, UseGuards } from '@nestjs/common';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { PassportJwtGuard } from './guards/passport-jwt.guard';
import type { Response } from 'express';
import { CurrentUser } from './decorator/current-user.decorator';
import { responseLoginDto } from './dto/response-login.dto';
import { logoutDto } from './dto/logout.dto';
import { PassportJwtRefreshGuard } from './guards/passport-jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {} 

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  async login(
    @CurrentUser() user: responseLoginDto,
    @Res({ passthrough: true }) response: Response) {
	    await this.authService.logIn(user, response);
  }

  @Post('refresh')
  @UseGuards(PassportJwtRefreshGuard)
  async refresh(
    @CurrentUser() user: responseLoginDto,
    @Res({ passthrough: true }) response: Response) {
      await this.authService.renewAccessToken(user, response);
  }

  @Post('logout')
  @UseGuards(PassportJwtGuard)
  async logout(
    @CurrentUser() user: logoutDto,
    @Res({ passthrough: true }) response: Response) {
      await this.authService.logOut(user, response);
  }
  
  //test route
  // @Get('me')
  // @UseGuards(PassportJwtGuard)
  // getUserInfo(
  //   @CurrentUser() user: logoutDto) {
	//     return user;
  // }
}