import { Injectable, UnauthorizedException } from '@nestjs/common';
import { playerTable } from 'src/shared/db/schema';
import type { playerSelect } from 'src/shared/db/schema';
import { eq } from 'drizzle-orm';
import { UtilsService } from 'src/shared/services/utils.func.service';

type AuthInput = {
  username: string;
  password: string;
};
type AuthResult = {
  accessToken: string;
  userId: number;
  username: string;
};

@Injectable()
export class AuthService {
	constructor (private utilsService: UtilsService) {}

	async authenticate(input: AuthInput): Promise<AuthResult> {
		const [user] = await this.utilsService.findPlayersBy('and', undefined, eq(playerTable.gameName, input.username), eq(playerTable.pwd, input.password)) as playerSelect[];
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		return {
			accessToken: 'mock-access-token',
			userId: Number(user.playerId),
			username: String(user.gameName),
		};
	}
}

