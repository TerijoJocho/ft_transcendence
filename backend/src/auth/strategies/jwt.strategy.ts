import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UtilsService } from '../../shared/services/utils.func.service';
import { playerTable } from '../../shared/db/schema';
import type { playerSelect } from '../../shared/db/schema';
import { eq } from 'drizzle-orm';
import { logoutDto } from '../dto/logout.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly utilsService: UtilsService,
		private readonly jwtService: JwtService,
	)
	{
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => request.cookies?.Access]),
			secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
		});
	}

	async validate(payload: { sub: number }) {
		const user = (await this.utilsService.findPlayersBy('and', undefined, eq(playerTable.playerId, payload.sub)) as playerSelect[])[0];
		if (!user)
			throw new UnauthorizedException('Invalid token.');
		return { playerId: user.playerId } as logoutDto;
	}
}
