import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(private readonly AuthService: AuthService)
	{
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => request.cookies?.Refresh]),
			secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: { sub: number; pseudo: string }) {
		return this.AuthService.verifyRefreshToken(payload.sub, request.cookies?.Refresh);
	}
}