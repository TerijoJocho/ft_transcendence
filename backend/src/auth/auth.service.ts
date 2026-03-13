import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { playerTable } from 'src/shared/db/schema';
import type { playerSelect } from 'src/shared/db/schema';
import { Response } from 'express';
import { eq } from 'drizzle-orm';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RedisService } from 'src/shared/services/redis.service';
import { ResponseLoginDto } from './dto/response-login.dto';
import { LogoutDto } from './dto/logout.dto';

type AuthTokenPayload = {
	sub: number;
	pseudo: string;
};

@Injectable()
export class AuthService {
	private readonly logger =  new Logger (AuthService.name);
	constructor (
		private readonly utilsService: UtilsService,
		private readonly jwtService: JwtService,
		private readonly redisService: RedisService,
	) {}

	async logIn(user: ResponseLoginDto, response: Response): Promise<Response> {
		try {
			const redisClient = this.redisService.getClient();
			const accessExpirationMs = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS);
    		const refreshExpirationMs = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS);
			const expiresAccessToken = new Date(Date.now() + accessExpirationMs);
			const expiresRefreshToken = new Date(Date.now() + refreshExpirationMs);
			const accessExpirationSec = Math.floor(accessExpirationMs / 1000);
			const refreshExpirationSec = Math.floor(refreshExpirationMs / 1000);

			const tokenPayload: AuthTokenPayload = {
				sub: user.playerId, 
				pseudo: user.identifier,
			};

			const accessToken: string = this.jwtService.sign(tokenPayload, 
				{
					secret: process.env.JWT_ACCESS_TOKEN_SECRET,
					expiresIn: accessExpirationSec,
				} as JwtSignOptions
			);

			const refreshToken: string = this.jwtService.sign(tokenPayload, 
				{
					secret: process.env.JWT_REFRESH_TOKEN_SECRET,
					expiresIn: refreshExpirationSec,
				} as JwtSignOptions
			);

			await redisClient.set('refreshToken:' + user.playerId, refreshToken, { EX: refreshExpirationMs / 1000 });

			response.cookie('Access', accessToken, 
				{
        			httpOnly: true,
        			secure: process.env.NODE_ENV === 'production',
       				expires: expiresAccessToken,
    			}
			);

    		response.cookie('Refresh', refreshToken, 
				{
        			httpOnly: true,
        			secure: process.env.NODE_ENV === 'production',
        			expires: expiresRefreshToken,
      			}
			);

			return response.json(user);
		}
		catch (error) {
			this.logger.error('Login error:', error);
			throw new UnauthorizedException('Login failed. Please check your credentials and try again.');
		}
	}

	renewAccessToken(user: ResponseLoginDto, response: Response): Response {
		const accessExpirationMs = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS);
		const expiresAccessToken = new Date(Date.now() + accessExpirationMs);
			
		const tokenPayload: AuthTokenPayload = {
			sub: user.playerId, 
			pseudo: user.identifier,
		};

		const accessToken: string = this.jwtService.sign(tokenPayload, 
			{
				secret: process.env.JWT_ACCESS_TOKEN_SECRET,
				expiresIn: accessExpirationMs,
			} as JwtSignOptions
		);

		response.cookie('Access', accessToken, 
			{
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				expires: expiresAccessToken,
			}
		);
		return response.json(user);
	}

	async verifyUser(username: string, password: string): Promise<playerSelect> {
		const user = (await this.utilsService.findPlayersBy('and', undefined, eq(playerTable.gameName, username), eq(playerTable.pwd, password)) as playerSelect[])[0];
		if (!user) {
			throw new UnauthorizedException('Invalid credentials.');
		}
		return user;
	}

	async verifyRefreshToken(playerId: number, refreshToken: string): Promise<ResponseLoginDto> {
		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token is missing.');
		}
		const redisClient = this.redisService.getClient();
		const storedRefreshToken = await redisClient.get('refreshToken:' + playerId);
		if (!storedRefreshToken)
			throw new UnauthorizedException('Refresh token not found in cache.');
		if (storedRefreshToken !== refreshToken) {
			throw new UnauthorizedException('Refresh token does not match cache.');
		}
		const decoded = this.jwtService.verify<AuthTokenPayload>(refreshToken, {
			secret: process.env.JWT_REFRESH_TOKEN_SECRET,
		});
		if (!decoded?.sub || !decoded?.pseudo || decoded.sub !== playerId) {
			throw new UnauthorizedException('Invalid refresh token payload.');
		}
		return { identifier: decoded.pseudo, playerId: decoded.sub };
	}

	async logOut (user: LogoutDto, response: Response) {
		await this.redisService.getClient().del('refreshToken:' + user.playerId);
		response.clearCookie('Access');
		response.clearCookie('Refresh');
		response.status(200).json({message: 'successfully logged out'});
	}
}

