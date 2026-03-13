import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { responseLoginDto } from '../dto/response-login.dto';

type RequestWithCookies = Request & {
	cookies?: Record<string, string | undefined>;
};

const extractRefreshToken = (request: Request): string | null => {
	const cookies = (request as RequestWithCookies).cookies;
	const refreshToken = cookies?.Refresh;
	return typeof refreshToken === 'string' ? refreshToken : null;
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