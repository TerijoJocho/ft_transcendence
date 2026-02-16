import { Body, Controller, Post } from '@nestjs/common';
import { SigninService } from './signin/signin.service';
import { SigninDto } from './signin/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private signinService: SigninService) { }

  @Post('register')
  register(@Body() bodyDto: SigninDto) {
    return this.signinService.registerPlayers(
      bodyDto.pseudo,
      bodyDto.mail,
      bodyDto.password
    );
  }
}
