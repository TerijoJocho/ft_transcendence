import {
  Injectable,
  ConflictException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateDoubleFactorDto } from './dto/UpdateDoubleFactorDto';
import { UtilsService } from 'src/shared/services/utils.func.service';
import { RedisService } from 'src/shared/services/redis.service';
import speakeasy from 'speakeasy';
import { eq } from 'drizzle-orm';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import { playerTable } from 'src/shared/db/schema';
import { deleteDoubleFactorDto } from './dto/deleteDoubleFactorDto';

type VaultEncryptResponse = {
  data?: {
    ciphertext?: string;
  };
};

type VaultDecryptResponse = {
  data?: {
    plaintext?: string;
  };
};

/* reste a faire
  gerer l update, ajouter une colonne dans la db pour tocker le mdp crypter */

@Injectable()
export class DoubleFactorService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly redisService: RedisService,
  ) {}
  private static readonly MAX_2FA_FAILED_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION_MS = 1 * 60 * 1000;
  private static readonly FAILED_ATTEMPTS_KEY_PREFIX =
    'twoFactor:failedAttempts:';
  private static readonly LOCK_UNTIL_KEY_PREFIX = 'twoFactor:lockUntil:';

  private getFailedAttemptsKey(userId: number) {
    return `${DoubleFactorService.FAILED_ATTEMPTS_KEY_PREFIX}${userId}`;
  }

  private getLockUntilKey(userId: number) {
    return `${DoubleFactorService.LOCK_UNTIL_KEY_PREFIX}${userId}`;
  }

  private getRedisClient() {
    return this.redisService.getClient();
  }

  private async getTwoFactorState(userId: number) {
    const redisClient = this.getRedisClient();
    const [failedAttemptsRaw, lockUntilRaw] = await Promise.all([
      redisClient.get(this.getFailedAttemptsKey(userId)),
      redisClient.get(this.getLockUntilKey(userId)),
    ]);

    return {
      failedAttempts: Number(failedAttemptsRaw ?? 0),
      lockUntil: lockUntilRaw ? new Date(String(lockUntilRaw)) : null,
    };
  }

  private async setFailedAttempts(userId: number, failedAttempts: number) {
    await this.getRedisClient().set(
      this.getFailedAttemptsKey(userId),
      String(failedAttempts),
    );
  }

  private async setLockUntil(userId: number, lockUntil: Date | null) {
    const redisClient = this.getRedisClient();
    if (!lockUntil) {
      await redisClient.del(this.getLockUntilKey(userId));
      return;
    }

    await redisClient.set(
      this.getLockUntilKey(userId),
      lockUntil.toISOString(),
    );
  }

  private async resetTwoFactorState(userId: number) {
    const redisClient = this.getRedisClient();
    await Promise.all([
      redisClient.del(this.getFailedAttemptsKey(userId)),
      redisClient.del(this.getLockUntilKey(userId)),
    ]);
  }

  private async verify2faCodeForUser(userId: number, reply_code: string) {
    const ciphertext = (await this.utilsService.findPlayersBy(
      'and',
      {
        ciphertextInDb: playerTable.twoFactorSecretCiphertext,
      },
      eq(playerTable.playerId, userId),
    )) as Array<{
      ciphertextInDb: string;
    }>;

  const row = ciphertext[0];
  if (!row || typeof row.ciphertextInDb !== 'string' || row.ciphertextInDb.length === 0) 
    throw new NotFoundException('2FA secret not found');
  
    const { failedAttempts, lockUntil } = await this.getTwoFactorState(userId);
    const now = Date.now();

    if (lockUntil && lockUntil.getTime() > now) {
      const remainingMs = lockUntil.getTime() - now;
      const remainingSec = Math.ceil(remainingMs / 1000);
      throw new HttpException(
        `Too many failed attempts, retry in ${remainingSec}s`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const httpsAgent = new https.Agent({
      ca: fs.readFileSync(process.env.VAULT_CACERT),
      rejectUnauthorized: true,
    });

    const response = await axios.post<VaultDecryptResponse>(
      `${process.env.VAULT_ADDR}/v1/transit/decrypt/totp-secrets`,
      { ciphertext: ciphertext[0].ciphertextInDb },
      {
        headers: { 'X-Vault-Token': process.env.BACKEND_VAULT_TOKEN },
        httpsAgent,
      },
    );

    const plaintextBase64 = response.data?.data?.plaintext;
    if (!plaintextBase64)
      throw new InternalServerErrorException('Vault decrypt failed');

    const plaintextBase32 = Buffer.from(plaintextBase64, 'base64').toString(
      'utf8',
    );

    const match = speakeasy.totp.verify({
      secret: plaintextBase32,
      encoding: 'base32',
      token: reply_code,
      window: 1,
    });

    if (!match) {
      const newFailedAttempts = failedAttempts + 1;

      if (newFailedAttempts >= DoubleFactorService.MAX_2FA_FAILED_ATTEMPTS) {
        const newLockUntil = new Date(
          Date.now() + DoubleFactorService.LOCKOUT_DURATION_MS,
        );
        await Promise.all([
          this.setFailedAttempts(userId, newFailedAttempts),
          this.setLockUntil(userId, newLockUntil),
        ]);

        throw new HttpException(
          'Too many failed attempts',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      await this.setFailedAttempts(userId, newFailedAttempts);

      throw new HttpException('Invalid 2FA code', HttpStatus.UNAUTHORIZED);
    }
  }

  async setup2fa(userId: number) {
    try {
      const check2fa = (await this.utilsService.findPlayersBy(
        'and',
        {
          twofa: playerTable.twoFactorEnabled,
        },
        eq(playerTable.playerId, userId),
      )) as Array<{ twofa: boolean }>;

      if (!check2fa?.length) throw new NotFoundException('User not found');

      if (check2fa[0].twofa)
        throw new ConflictException('Two factor method is already active');

      const secret = speakeasy.generateSecret({
        name: 'Chess42',
        length: 20,
      });

      if (!secret.otpauth_url || !secret.base32)
        throw new InternalServerErrorException(
          'Failed to generate TOTP secret',
        );

      const plaintextBase64 = Buffer.from(secret.base32, 'utf8').toString(
        'base64',
      );

      const httpsAgent = new https.Agent({
        ca: fs.readFileSync(process.env.VAULT_CACERT),
        rejectUnauthorized: true,
      });

      const encryptedResponse = await axios.post<VaultEncryptResponse>(
        `${process.env.VAULT_ADDR}/v1/transit/encrypt/totp-secrets`,
        { plaintext: plaintextBase64 },
        {
          headers: { 'X-Vault-Token': process.env.BACKEND_VAULT_TOKEN },
          httpsAgent,
        },
      );

      const ciphertext = encryptedResponse.data?.data?.ciphertext;
      if (!ciphertext)
        throw new InternalServerErrorException(
          'Vault did not return ciphertext',
        );

      const update = await this.utilsService.updatePlayersBy(
        { twoFactorSecretCiphertext: ciphertext },
        'and',
        undefined,
        eq(playerTable.playerId, userId),
      );

      if (!update)
        throw new InternalServerErrorException('Failed to store 2FA secret');

      await this.resetTwoFactorState(userId);

      return {
        otpauthUrl: secret.otpauth_url,
        base32: secret.base32,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Failed to setup 2FA');
    }
  }

  async active2fa(data: UpdateDoubleFactorDto, reply_code: string) {
    try {
      await this.verify2faCodeForUser(data.userId, reply_code);

      const update = await this.utilsService.updatePlayersBy(
        { twoFactorEnabled: true },
        'and',
        undefined,
        eq(playerTable.playerId, data.userId),
      );
      if (!update)
        throw new InternalServerErrorException('Failed to enable 2FA');

      await this.resetTwoFactorState(data.userId);

      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to enable 2FA');
    }
  }

  async verify2faForLogin(data: UpdateDoubleFactorDto, reply_code: string) {
    try {
      await this.verify2faCodeForUser(data.userId, reply_code);

      await this.resetTwoFactorState(data.userId);

      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to validate login 2FA');
    }
  }

  async remove(id: number, data: deleteDoubleFactorDto) {
    try {
      const userRows = (await this.utilsService.findPlayersBy(
        'and',
        {
          pass: playerTable.pwd,
          twoFactorEnabled: playerTable.twoFactorEnabled,
          ciphertextInDb: playerTable.twoFactorSecretCiphertext,
        },
        eq(playerTable.playerId, id),
      )) as Array<{
        pass: string;
        twoFactorEnabled: boolean;
        ciphertextInDb: string;
      }>;
      if (!userRows?.length)
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      const user = userRows[0];
      if (!user || user.pass !== data.pwd)
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
      if (!user.twoFactorEnabled)
        throw new HttpException('2FA not active', HttpStatus.CONFLICT);
      const { failedAttempts, lockUntil } = await this.getTwoFactorState(id);
      if (lockUntil && lockUntil.getTime() > Date.now()) {
        const remainingSec = Math.ceil(
          (lockUntil.getTime() - Date.now()) / 1000,
        );
        throw new HttpException(
          `Too many failed attempts, retry in ${remainingSec}s`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const httpsAgent = new https.Agent({
        ca: fs.readFileSync(process.env.VAULT_CACERT),
        rejectUnauthorized: true,
      });

      const response = await axios.post<VaultDecryptResponse>(
        `${process.env.VAULT_ADDR}/v1/transit/decrypt/totp-secrets`,
        { ciphertext: user.ciphertextInDb },
        {
          headers: { 'X-Vault-Token': process.env.BACKEND_VAULT_TOKEN },
          httpsAgent,
        },
      );

      const plaintextBase64 = response.data?.data?.plaintext;
      if (!plaintextBase64)
        throw new InternalServerErrorException(
          'Vault decrypt returned empty plaintext',
        );
      const plaintextBase32 = Buffer.from(plaintextBase64, 'base64').toString(
        'utf8',
      );

      const match = speakeasy.totp.verify({
        secret: plaintextBase32,
        encoding: 'base32',
        token: data.replyCode,
        window: 1,
      });
      if (!match) {
        const newFailedAttempts = failedAttempts + 1;

        if (newFailedAttempts >= DoubleFactorService.MAX_2FA_FAILED_ATTEMPTS) {
          const newLockUntil = new Date(
            Date.now() + DoubleFactorService.LOCKOUT_DURATION_MS,
          );
          await Promise.all([
            this.setFailedAttempts(id, newFailedAttempts),
            this.setLockUntil(id, newLockUntil),
          ]);
          throw new HttpException(
            'Too many failed attempts',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        await this.setFailedAttempts(id, newFailedAttempts);
        throw new HttpException('Invalid 2FA code', HttpStatus.UNAUTHORIZED);
      }

      const update = await this.utilsService.updatePlayersBy(
        {
          twoFactorEnabled: false,
          twoFactorSecretCiphertext: null,
        },
        'and',
        undefined,
        eq(playerTable.playerId, id),
      );
      if (!update)
        throw new InternalServerErrorException('Failed to disable 2FA');

      await this.resetTwoFactorState(id);

      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to disable 2FA');
    }
  }
}
