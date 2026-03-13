import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { playerSelect } from 'src/shared/db/schema';
import { ResponseLoginDto } from '../dto/response-login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(private authService: AuthService) {
		super({
			usernameField: 'username',
			passwordField: 'password'
		});
	}

	async validate(username: string, password: string): Promise<ResponseLoginDto> {
		const user: playerSelect = await this.authService.verifyUser(username, password);
		return { playerId: user.playerId, identifier: user.gameName } as ResponseLoginDto;
	}
}