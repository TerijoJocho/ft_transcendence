import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { playerTable } from '../shared/db/schema';
import type { playerSelect } from '../shared/db/schema';
import { Response } from 'express';
import { eq, or } from 'drizzle-orm';
import { UtilsService } from '../shared/services/utils.func.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RedisService } from '../shared/services/redis.service';
import { ResponseLoginDto } from './dto/response-login.dto';
import { LogoutDto } from './dto/logout.dto';

type AuthTokenPayload = {
  sub: number;
  pseudo: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async logIn(
    user: ResponseLoginDto,
    response: Response,
    redirect = false,
  ): Promise<Response> {
    try {
      const redisClient = this.redisService.getClient();
      const accessExpirationMs = parseInt(
        process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS,
      );
      const refreshExpirationMs = parseInt(
        process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS,
      );
      const expiresAccessToken = new Date(Date.now() + accessExpirationMs);
      const expiresRefreshToken = new Date(Date.now() + refreshExpirationMs);
      const accessExpirationSec = Math.floor(accessExpirationMs / 1000);
      const refreshExpirationSec = Math.floor(refreshExpirationMs / 1000);

      const tokenPayload: AuthTokenPayload = {
        sub: user.playerId,
        pseudo: user.identifier,
      };

      const accessToken: string = this.jwtService.sign(tokenPayload, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: accessExpirationSec,
      } as JwtSignOptions);

      const refreshToken: string = this.jwtService.sign(tokenPayload, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: refreshExpirationSec,
      } as JwtSignOptions);

      await redisClient.set('refreshToken:' + user.playerId, refreshToken, {
        EX: refreshExpirationMs / 1000,
      });

      response.cookie('Access', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAccessToken,
      });

      response.cookie('Refresh', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresRefreshToken,
      });

      if (redirect) {
        const redirectUrl = new URL(process.env.AUTH_UI_REDIRECT);
        response.redirect(redirectUrl.toString());
        return response;
      }

      return response.json(user);
    } catch (error) {
      this.logger.error('Login error:', error);
      throw new UnauthorizedException(
        'Login failed. Please check your credentials and try again.',
      );
    }
  }

  renewAccessToken(user: ResponseLoginDto, response: Response): Response {
    const accessExpirationMs = parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS,
    );
    const expiresAccessToken = new Date(Date.now() + accessExpirationMs);
    const accessExpirationSec = Math.floor(accessExpirationMs / 1000);

    const tokenPayload: AuthTokenPayload = {
      sub: user.playerId,
      pseudo: user.identifier,
    };

    const accessToken: string = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: accessExpirationSec,
    } as JwtSignOptions);

    response.cookie('Access', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAccessToken,
    });
    return response.json(user);
  }

  async verifyUser(
    identifier: string,
    password: string,
  ): Promise<playerSelect> {
    const normalized = identifier.trim();
    const user = (
      (await this.utilsService.findPlayersBy(
        'and',
        undefined,
        or(
          eq(playerTable.playerName, normalized),
          eq(playerTable.mailAddress, normalized),
        ),
        eq(playerTable.pwd, password),
      )) as playerSelect[]
    )[0];
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return user;
  }

  async verifyRefreshToken(
    playerId: number,
    refreshToken: string,
  ): Promise<ResponseLoginDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing.');
    }
    const redisClient = this.redisService.getClient();
    const storedRefreshToken = await redisClient.get(
      'refreshToken:' + playerId,
    );
    if (!storedRefreshToken)
      throw new UnauthorizedException('Refresh token not found in cache.');
    if (storedRefreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token does not match cache.');
    }
    let decoded: AuthTokenPayload;
    try {
      decoded = this.jwtService.verify<AuthTokenPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      this.logger.error('Refresh token verification error:', error);
      throw new UnauthorizedException('Cannot decode refresh token.');
    }
    if (!decoded?.sub || !decoded?.pseudo || decoded.sub !== playerId) {
      throw new UnauthorizedException('Invalid refresh token payload.');
    }
    return { identifier: decoded.pseudo, playerId: decoded.sub };
  }

  async logOut(user: LogoutDto, response: Response) {
    await this.redisService.getClient().del('refreshToken:' + user.playerId);
    response.clearCookie('Access');
    response.clearCookie('Refresh');
    response.status(200).json({ message: 'successfully logged out' });
  }

  async me(playerId: number) {
    const user = (await this.utilsService.findPlayersBy(
      'and',
      undefined,
      eq(playerTable.playerId, playerId),
    )) as playerSelect[];

    if (user.length === 0) {
      throw new UnauthorizedException('User not found.');
    }

    const lvl = (await this.utilsService.getTotalWins(user[0].playerId))[0];
    const lvlVal: number = lvl?.totalWins ?? 0;

    const loss = (await this.utilsService.getTotalLosses(user[0].playerId))[0];
    const lossVal: number = loss?.totalLosses ?? 0;

    const draws = (await this.utilsService.getTotalDraws(user[0].playerId))[0];
    const drawVal: number = draws?.totalDraws ?? 0;

    const gameNb = (
      await this.utilsService.getTotalGamesPlayed(user[0].playerId)
    )[0];
    const gameVal: number = gameNb?.totalGames ?? 0;

    const wr = (await this.utilsService.getWinrate(user[0].playerId))[0];
    const winrateVal: number = wr?.winrate ?? 0;

    const color = (
      await this.utilsService.getFavouriteColor(user[0].playerId)
    )[0];
    const colorVal: string = color?.playerColor ?? 'unknown';

    const gm = (
      await this.utilsService.getFavouriteGameMode(user[0].playerId)
    )[0];
    const gameModeVal: string = gm?.gameMode ?? 'unknown';

    const cws = (
      await this.utilsService.getCurrentWinStreak(user[0].playerId)
    )[0];
    const cwsVal: number = cws?.currentStreak ?? 0;

    const lws = (
      await this.utilsService.getLongestWinStreak(user[0].playerId)
    )[0];
    const lwsVal: number = lws?.longestStreak ?? 0;

    const gameHistory = await this.utilsService.getGameHistory(
      user[0].playerId,
    );
    const historyVal = gameHistory ? gameHistory : undefined;

    return {
      id: user[0].playerId,
      pseudo: user[0].playerName,
      status: 'ONLINE', // This is a placeholder. Track user status with websockets.
      elo: 2000, // Placeholder. Implement ELO calculation based on game results or remove from frontend.
      winCount: lvlVal,
      lossCount: lossVal,
      drawCount: drawVal,
      totalGames: gameVal,
      winrate: winrateVal,
      favColor: colorVal,
      favGameMode: gameModeVal,
      currentWinStreak: cwsVal,
      longestWinStreak: lwsVal,
      gameHistoryList: historyVal,
      avatar: user[0].avatarUrl,
    };
  }
}
