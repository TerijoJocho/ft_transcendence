import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SigninService } from './signin/signin.service';
import { SigninDto } from './signin/signin.dto';
import { UserService } from './userService/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private signinService: SigninService,
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

  @Post('delete/:id') // penser a verifier que c'est bien le user qui veut supprimer son compte
  async deleteUser(@Param('id', ParseIntPipe) playerId: number) {
    await this.userService.deleteUserbyId(playerId);
    return { message: 'User deleted successfully' };
  }

  @Post('update')
  update() {
    return { message: 'User data updated successfully' };
  }
}
