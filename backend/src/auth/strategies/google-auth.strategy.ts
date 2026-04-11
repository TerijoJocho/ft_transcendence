import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { playerSelect, playerTable } from 'src/shared/db/schema';
import { eq } from 'drizzle-orm';
import { UserService } from 'src/users/user.service';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UserService,
    private readonly utilsService: UtilsService,
  ) {
    super({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const displayName = profile.displayName;
    const primaryEmail = profile.emails?.[0]?.value;
    console.log('Google profile:', profile);

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
        console.log('Existing user found for email:', primaryEmail);
        return isExist[0];
      }
    } catch (error) {
      console.error('Database error during Google OAuth: cannot find player', error);
      throw new ServiceUnavailableException('Database error during Google OAuth.');
    }
        const user = await this.userService.registerPlayers(
          primaryEmail,
          displayName
        );
        return user;
  }
}
