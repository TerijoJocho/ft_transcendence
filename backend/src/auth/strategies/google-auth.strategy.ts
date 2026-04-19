import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { playerSelect, playerTable } from 'src/shared/db/schema';
import { eq } from 'drizzle-orm';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from '../dto/login.dto';

type CreatedUser = {
  playerId?: number;
  playerName?: string;
  id?: number;
  pseudo?: string;
};

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UsersService,
    private readonly utilsService: UtilsService,
  ) {
    super({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  authorizationParams() {
    return {
      access_type: 'offline',
      prompt: 'select_account consent',
      include_granted_scopes: 'false',
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<LoginDto> {
    const displayName = profile.displayName;
    const primaryEmail = profile.emails?.[0]?.value;
    if (!primaryEmail) {
      throw new ServiceUnavailableException('Google profile email is missing.');
    }
    try {
      const isExist = (await this.utilsService.findPlayersBy(
        'and',
        undefined,
        eq(playerTable.mailAddress, primaryEmail),
      )) as playerSelect[];
      if (isExist.length > 0) {
        return {
          playerId: isExist[0].playerId,
          identifier: isExist[0].playerName,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
        } as LoginDto;
      }
    } catch (error) {
      throw new ServiceUnavailableException(
        error,
        'Database error during Google OAuth.',
      );
    }
    const user = (
      await this.userService.registerPlayers(primaryEmail, displayName)
    )[0] as CreatedUser;

    return {
      playerId: user.playerId,
      identifier: user.playerName,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
    } as LoginDto;
  }
}
