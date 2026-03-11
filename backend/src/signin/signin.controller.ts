import { SigninService }  from './signin.service';
import { Body, Controller, Post } from '@nestjs/common';
import { SigninDto } from './signin.dto';

@Controller('signin')
export class SigninController {
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