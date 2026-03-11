import { Body, Controller, Post } from '@nestjs/common';
import { SigninService } from './signin/signin.service';
import { SigninDto } from './signin/signin.dto';
import { UserService } from './userService/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private signinService: SigninService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  register(@Body() bodyDto: SigninDto) {
    return this.signinService.registerPlayers(
      bodyDto.mail,
      bodyDto.pseudo,
      bodyDto.password,
    );
  }

  @Post('auth/me')
  authMe() {
    return { message: 'Authenticated user data would be here' };
  }

  @Post('logout')
  logout() {
    this.userService.logout();
    return { message: 'User logged out successfully' };
  }

  @Post('update')
  update() {
    return { message: 'User data updated successfully' };
  }
}
