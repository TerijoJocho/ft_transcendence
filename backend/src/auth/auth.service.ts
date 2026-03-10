import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { playerTable } from 'src/shared/db/schema';
import type { playerSelect } from 'src/shared/db/schema';
import { Response } from 'express';
import { eq } from 'drizzle-orm';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RedisService } from 'src/shared/services/redis.service';
import { responseLoginDto } from './dto/response-login.dto';
import { logoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
	private readonly logger =  new Logger (AuthService.name);
	constructor (
		private readonly utilsService: UtilsService, 
		private readonly jwtService: JwtService,
		private readonly redisService: RedisService,
	) {}

	async login(user: responseLoginDto, response: Response) {
		const redisClient = this.redisService.getClient();
		const accessExpirationMs = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS);
    	const refreshExpirationMs = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS);
		const expiresAccessToken = new Date(Date.now() + accessExpirationMs);
		const expiresRefreshToken = new Date(Date.now() + refreshExpirationMs);
	
		const tokenPayload = { 
			sub: user.playerId, 
			pseudo: user.identifier,
		};

		const accessToken = this.jwtService.sign(tokenPayload, 
			{
				secret: process.env.JWT_ACCESS_TOKEN_SECRET,
				expiresIn: accessExpirationMs,
			} as JwtSignOptions
		);

		const refreshToken = this.jwtService.sign(tokenPayload, 
			{
				secret: process.env.JWT_REFRESH_TOKEN_SECRET,
				expiresIn: refreshExpirationMs,
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

	async renewAccessToken(user: responseLoginDto, response: Response) {
		const accessExpirationMs = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS);
		const expiresAccessToken = new Date(Date.now() + accessExpirationMs);
			
		const tokenPayload = { 
			sub: user.playerId, 
			pseudo: user.identifier,
		};

		const accessToken = this.jwtService.sign(tokenPayload, 
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

	async verifyUser(pseudo: string, password: string): Promise<playerSelect> {
		const user = (await this.utilsService.findPlayersBy('and', undefined, eq(playerTable.gameName, pseudo), eq(playerTable.pwd, password)) as playerSelect[])[0];
		if (!user) {
			throw new UnauthorizedException('Unvalid credentials.');
		}
		return user;
	}

	async verifyRefreshToken(playerId: number, refreshToken: string): Promise<responseLoginDto> {
		try {
			const redisClient = this.redisService.getClient();
			const storedRefreshToken = await redisClient.get('refreshToken:' + playerId);
			const decoded = this.jwtService.decode(refreshToken) as { sub: number, pseudo: string };
			if (!storedRefreshToken 
				|| storedRefreshToken !== refreshToken 
				|| !this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_TOKEN_SECRET })) {
						throw new UnauthorizedException('Invalid refresh token.');
			}
			return { identifier: decoded.pseudo, playerId: playerId } as responseLoginDto;
		}
		catch (error) {
			throw new UnauthorizedException('Verify user refresh token error.');
		}
	}

	async logOut (user: logoutDto, response: Response) {
		await this.redisService.getClient().del('refreshToken:' + user.playerId);
		response.clearCookie('Access');
		response.clearCookie('Refresh');
		response.status(200).json({message: 'successfully logged out'})
	}
}

