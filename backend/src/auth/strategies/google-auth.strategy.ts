import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { SigninService } from '../../signin/signin.service';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { playerSelect, playerTable } from 'src/shared/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly signinService: SigninService,
    private readonly utilsService: UtilsService,
  ) {
    super({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    const { displayName, emails } = profile;
    try {
      const isExist: playerSelect[] | { [x: string]: unknown }[] =
        await this.utilsService.findPlayersBy(
          'and',
          undefined,
          eq(playerTable.mailAddress, emails[0].value),
        );
      if (isExist && isExist.length === 0) {
        const user: playerSelect | { [x: string]: unknown } = (
          await this.signinService.registerPlayers(emails[0].value, displayName)
        )[0];
        return user;
      }
      return isExist[0];
    } catch {
      throw new ServiceUnavailableException(
        'Cannot find or register new player with Google OAuth.',
      );
    }
  }
}
