import {
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { playerTable } from '../shared/db/schema';
import type { playerSelect } from '../shared/db/schema';
import { Response } from 'express';
import { eq, isNull, or } from 'drizzle-orm';
import { UtilsService } from '../shared/services/utils.func.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RedisService } from '../shared/services/redis.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { DoubleFactorService } from '../double_factor/double_factor.service';
import { TwoFactorDto } from './dto/twoFactorDto';

type AuthTokenPayload = {
  sub: number;
  pseudo: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly twoFactor: DoubleFactorService,
  ) {}

  async finalizeLogin(
    user: LoginDto,
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

      const googleTokenToRevoke: string =
        user.googleRefreshToken || user.googleAccessToken;
      if (googleTokenToRevoke) {
        await redisClient.set(
          'googleToken:' + user.playerId,
          googleTokenToRevoke,
          {
            EX: refreshExpirationMs / 1000,
          },
        );
      }

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
        if (!redirectUrl)
          throw new ServiceUnavailableException(
            'Login succeeded, but redirect is unavailable because the server is misconfigured.',
          );
        response.redirect(redirectUrl.toString());
        return response;
      }

      return response.json(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new UnauthorizedException(
        error,
        'Login failed. Please check your credentials and try again.',
      );
    }
  }

  async logIn(
    user: LoginDto,
    response: Response,
    redirect = false,
  ): Promise<Response> {
    try {
      const check2fa = (await this.utilsService.findPlayersBy(
        `and`,
        {
          twofa: playerTable.twoFactorEnabled,
        },
        eq(playerTable.playerId, user.playerId),
      )) as Array<{ twofa: boolean }>;
      if (!check2fa?.length) throw new NotFoundException('Player not found');
      if (check2fa[0].twofa)
        return response.json({
          requiresTwoFactor: true,
          message: '2FA required',
        });
      return this.finalizeLogin(user, response, redirect);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new UnauthorizedException('Login failed');
    }
  }

  async logInTwoFactor(
    user: LoginDto,
    response: Response,
    data: TwoFactorDto,
  ): Promise<Response> {
    await this.twoFactor.verify2faForLogin(
      { userId: user.playerId },
      data.reply_code,
    );
    return this.finalizeLogin(user, response, data.redirect);
  }

  renewAccessToken(user: LoginDto, response: Response): Response {
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
    const pwdCheck = (await this.utilsService.findPlayersBy(
      'and',
      undefined,
      or(
        eq(playerTable.playerName, normalized),
        eq(playerTable.mailAddress, normalized),
      ),
      isNull(playerTable.pwd),
    )) as playerSelect[];
    if (pwdCheck.length > 0)
      throw new UnauthorizedException('Invalid credentials.');
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
    if (!user) throw new UnauthorizedException('Invalid credentials.');
    return user;
  }

  async verifyRefreshToken(
    playerId: number,
    refreshToken: string,
  ): Promise<LoginDto> {
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token is missing.');
    const redisClient = this.redisService.getClient();
    const storedRefreshToken = await redisClient.get(
      'refreshToken:' + playerId,
    );
    if (!storedRefreshToken)
      throw new UnauthorizedException('Refresh token not found in cache.');
    if (storedRefreshToken !== refreshToken)
      throw new UnauthorizedException('Refresh token does not match cache.');
    let decoded: AuthTokenPayload;
    try {
      decoded = this.jwtService.verify<AuthTokenPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(error, 'Cannot decode refresh token.');
    }
    if (!decoded?.sub || !decoded?.pseudo || decoded.sub !== playerId)
      throw new UnauthorizedException('Invalid refresh token payload.');
    return { identifier: decoded.pseudo, playerId: decoded.sub };
  }

  async logOut(user: LogoutDto, response: Response): Promise<void> {
    const redisClient = this.redisService.getClient();

    const googleToken = (await redisClient.get(
      'googleToken:' + user.playerId,
    )) as string;
    if (googleToken) {
      try {
        await this.revokeGoogleToken(googleToken);
      } catch (error) {
        throw new ServiceUnavailableException(
          error,
          'Failed to revoke Google token',
        );
      }
    }

    await redisClient.del('refreshToken:' + user.playerId);
    await redisClient.del('googleToken:' + user.playerId);
    response.clearCookie('Access');
    response.clearCookie('Refresh');
    response.status(200).json({ message: 'successfully logged out' });
  }

  async revokeGoogleToken(token: string): Promise<void> {
    const revokeResponse = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ token }),
    });
    if (!revokeResponse.ok) throw new Error('Google revoke failed.');
  }
}
