import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UtilsService } from '../../shared/services/utils.func.service';
import { playerTable } from '../../shared/db/schema';
import type { playerSelect } from '../../shared/db/schema';
import { eq } from 'drizzle-orm';
import { LogoutDto } from '../dto/logout.dto';

const extractAccessToken = (request: Request): string | null => {
  const token = (
    request as unknown as { cookies?: Record<string, string | undefined> }
  ).cookies?.Access;
  return token ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly utilsService: UtilsService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractAccessToken]),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: { sub: number }): Promise<LogoutDto> {
    try {
      const user = (
        (await this.utilsService.findPlayersBy(
          'and',
          undefined,
          eq(playerTable.playerId, payload.sub),
        )) as playerSelect[]
      )[0];
      return { playerId: user.playerId } as LogoutDto;
    } catch {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
