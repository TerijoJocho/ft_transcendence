import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { responseLoginDto } from '../dto/response-login.dto';

const extractRefreshToken = (request: Request): string | null => {
	const token = (request as unknown as { cookies?: Record<string, string | undefined> }).cookies?.Refresh;
	return token ?? null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(private readonly authService: AuthService)
	{
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([extractRefreshToken]),
			secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: { sub: number; pseudo: string }): Promise<responseLoginDto> {
		const refreshToken = extractRefreshToken(request);
		if (!refreshToken)
			throw new UnauthorizedException('Refresh token is missing.');
		return this.authService.verifyRefreshToken(payload.sub, refreshToken);
	}
}