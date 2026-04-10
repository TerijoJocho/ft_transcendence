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

  // async validate(
  //   _accessToken: string,
  //   _refreshToken: string,
  //   profile: Profile,
  // ) {
  //   const displayName = profile.displayName;
  //   const primaryEmail = profile.emails?.[0]?.value;

  //   if (!primaryEmail) {
  //     throw new ServiceUnavailableException('Google profile email is missing.');
  //   }

  //   try {
  //     const isExist = (await this.utilsService.findPlayersBy(
  //       'and',
  //       undefined,
  //       eq(playerTable.mailAddress, primaryEmail),
  //     )) as playerSelect[];
  //     if (isExist && isExist.length === 0) {
  //       const user = (
  //         await this.userService.registerPlayers(primaryEmail, displayName)
  //       )[0] as playerSelect;
  //       return user;
  //     }
  //     return isExist[0];
  //   } catch {
  //     throw new ServiceUnavailableException(
  //       'Cannot find or register new player with Google OAuth.',
  //     );
  //   }
  // }
  async validate(
  _accessToken: string,
  _refreshToken: string,
  profile: Profile,
) {
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

    if (!isExist || isExist.length === 0) {
      const user = await this.userService.registerPlayers(
        primaryEmail,
        displayName,
      );
      return user[0];
    }

    return isExist[0];
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw new ServiceUnavailableException(
      'Cannot find or register new player with Google OAuth.',
    );
  }
}
}
