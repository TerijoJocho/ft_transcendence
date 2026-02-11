import { Body, Controller, Post } from '@nestjs/common';
import { SigninService } from './signin.service';
import { SigninDto } from './Signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private signinService: SigninService) {}

  @Post('register')
  register(@Body() bodyDto: SigninDto) {
    return this.signinService.registerPlayers(
      bodyDto.mail,
      bodyDto.pseudo,
      bodyDto.password,
    );
  }
}
