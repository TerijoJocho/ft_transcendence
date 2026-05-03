import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  NotFoundException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { UtilsService } from '../shared/services/utils.func.service';
import { eq, ne } from 'drizzle-orm';
import {
  playerTable,
  playerInsert,
  friendshipTable,
  participationTable,
  playerSelect,
} from '../shared/db/schema';
import { UpdateUserDto } from './dto/updateDto';
import { RedisService } from '../shared/services/redis.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

type UserStatsResponse = {
  id: number;
  pseudo: string;
  winCount: number;
  lossCount: number;
  drawCount: number;
  totalGames: number;
  winrate: number;
  favColor: string;
  favGameMode: string;
  currentWinStreak: number;
  longestWinStreak: number;
  gameHistoryList?: any[]; // Adjust type based on actual game history structure
};

type weeklyWinrateResponse = {
  timezone: string;
  weekStart: string;
  points: {
    dayIndex: number;
    date: string;
    winrate: number;
  }[];
};

type leaderboardEntry = {
  playerId: number;
  playerName: string;
  playerLevel: number;
};

export type OngoingGameInfo = {
  gameId: number,
  gameMode: string,
  gameStatus: string,
  playerColor: string,
};

export type UserDataResponse = playerSelect & { ongoingGames: OngoingGameInfo[] };

@Injectable()
export class UsersService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly redisService: RedisService,
  ) {}

  async registerPlayers(
    mailAddress: string,
    gameName: string,
    pwd?: string,
  ): Promise<{ [x: string]: unknown }[]> {
    const existingUser = (await this.utilsService.findPlayersBy(
      'or',
      undefined,
      eq(playerTable.mailAddress, mailAddress),
      eq(playerTable.playerName, gameName),
    )) as playerSelect[];
    if (existingUser.length > 0)
      throw new InternalServerErrorException('User already exists');

    let isGoogle = false;
    if (!pwd) isGoogle = true;

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const hashedPassword = pwd ? await bcrypt.hash(pwd, saltRounds) : undefined;

    const currentPlayers: playerInsert = {
      playerName: gameName,
      mailAddress: mailAddress,
      pwd: hashedPassword || undefined,
      isGoogleUser: isGoogle,
    };

    return (await this.utilsService.insertPlayers([currentPlayers], {
      playerId: playerTable.playerId,
      playerName: playerTable.playerName,
    })) as { [x: string]: unknown }[];
  }

  async getDataUser(playerId: number): Promise<UserDataResponse> {
    const player = (await this.utilsService.findPlayersBy(
      'and',
      {
        id: playerTable.playerId,
        pseudo: playerTable.playerName,
        email: playerTable.mailAddress,
        avatarUrl: playerTable.avatarUrl,
        isGoogleUser: playerTable.isGoogleUser,
        twoFactorEnabled: playerTable.twoFactorEnabled,
      },
      eq(playerTable.playerId, playerId),
    )) as playerSelect[];

    if (!player.length) throw new NotFoundException('Player not found');
    
    const ongoingGames = (await this.utilsService.getAllOngoingGamesData(playerId)) as OngoingGameInfo[];
    console.log('Ongoing games for player', playerId, ':', ongoingGames);
    return { ...player[0], ongoingGames };
  }

  async deleteUserbyId(playerId: number, response: Response): Promise<void> {
    const user = (await this.utilsService.findPlayersBy(
      'and',
      undefined,
      eq(playerTable.playerId, playerId),
    )) as playerSelect[];
    if (user.length === 0) throw new NotFoundException('Player not found');

    await this.utilsService.deleteParticipationsBy(
      'and',
      undefined,
      eq(participationTable.playerId, playerId),
    );

    await this.utilsService.deleteFriendshipsBy(
      'or',
      undefined,
      eq(friendshipTable.player1Id, playerId),
      eq(friendshipTable.player2Id, playerId),
    );

    await this.utilsService.deletePlayersBy(
      'and',
      undefined,
      eq(playerTable.playerId, playerId),
    );

    const googleToken = (await this.redisService
      .getClient()
      .get('googleToken:' + playerId)) as string;
    if (googleToken) {
      try {
        const revokeResponse = await fetch(
          'https://oauth2.googleapis.com/revoke',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ token: googleToken }),
          },
        );
        if (!revokeResponse.ok) throw new Error('Google revoke failed.');
      } catch (error) {
        throw new ServiceUnavailableException(
          error,
          'Failed to revoke Google token',
        );
      }
    }

    await this.redisService.getClient().del('googleToken:' + playerId);
    await this.redisService.getClient().del('refreshToken:' + playerId);
    response.clearCookie('Access');
    response.clearCookie('Refresh');
    response
      .status(200)
      .json({ message: 'User ' + playerId + ' deleted successfully' });
  }

  async updateUserData(
    userId: number,
    userData: UpdateUserDto,
  ): Promise<string> {
    try {
      const updatePayload: Partial<playerInsert> = {};
      updatePayload.playerName = userData.pseudo;
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
      const user = (
        await this.utilsService.findPlayersBy(
          'and',
          undefined,
          eq(playerTable.playerId, userId),
        )
      )[0] as playerSelect;

      if (user.isGoogleUser === false)
        updatePayload.mailAddress = userData.email;

      if (userData.newPassword !== undefined && user.isGoogleUser === false) {
        try {
          updatePayload.pwd = await bcrypt.hash(
            userData.newPassword,
            saltRounds,
          );
        } catch {
          throw new InternalServerErrorException('Error hashing password');
        }
      }

      if (userData.avatar !== undefined)
        updatePayload.avatarUrl = userData.avatar;

      const playerNameCheck = await this.utilsService.findPlayersBy(
        'and',
        undefined,
        eq(playerTable.playerName, userData.pseudo),
        ne(playerTable.playerId, userId),
      );
      if (playerNameCheck.length > 0) {
        throw new InternalServerErrorException('Pseudo already exists');
      }

      const emailCheck = await this.utilsService.findPlayersBy(
        'and',
        undefined,
        eq(playerTable.mailAddress, userData.email),
        ne(playerTable.playerId, userId),
      );
      if (emailCheck.length > 0) {
        throw new InternalServerErrorException('Email already exists');
      }

      await this.utilsService.updatePlayersBy(
        updatePayload,
        'and',
        {
          playerId: playerTable.playerId,
          gameName: playerTable.playerName,
          mailAddress: playerTable.mailAddress,
        },
        eq(playerTable.playerId, userId),
      );
      return 'User updated successfully';
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(error, 'Failed to update user');
    }
  }

  async userStats(playerId: number): Promise<UserStatsResponse> {
    const user = (await this.utilsService.findPlayersBy(
      'and',
      undefined,
      eq(playerTable.playerId, playerId),
    )) as playerSelect[];

    if (user.length === 0) throw new UnauthorizedException('User not found.');

    const stats = (
      await this.utilsService.getGamesResCounts(user[0].playerId)
    )[0];
    const lvlVal: number = stats?.totalWins ?? 0;
    const lossVal: number = stats?.totalLosses ?? 0;
    const drawVal: number = stats?.totalDraws ?? 0;
    const gameVal: number = stats?.totalGames ?? 0;
    const winrateVal: number = stats?.winRate ?? 0;

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
      10,
    );
    const historyVal = gameHistory ? gameHistory : undefined;

    return {
      id: user[0].playerId,
      pseudo: user[0].playerName,
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
    } as UserStatsResponse;
  }

  async weeklyWinrate(playerId: number): Promise<weeklyWinrateResponse> {
    try {
      const user = (await this.utilsService.findPlayersBy(
        'and',
        undefined,
        eq(playerTable.playerId, playerId),
      )) as playerSelect[];
      if (user.length === 0) {
        throw new UnauthorizedException('User not found.');
      }
      const winrate = await this.utilsService.getWeeklyWinrate(
        user[0].playerId,
      );
      return winrate;
    } catch (error) {
      throw new ServiceUnavailableException(
        error,
        'Cannot fetch weekly winrate.',
      );
    }
  }

  async getLeaderboard(): Promise<leaderboardEntry[]> {
    return this.utilsService.getLeaderboard();
  }
}
