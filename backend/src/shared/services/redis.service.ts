import { Injectable } from '@nestjs/common';
import { createClient } from '@keyv/redis';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: ReturnType<typeof createClient>;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl)
      throw new Error('REDIS_URL environment variable is not defined. Please set REDIS_URL to a valid Redis connection URL.');
    this.redis = createClient({ url: redisUrl });
    await this.redis.connect();
  }
  onModuleDestroy() {
    this.redis.destroy();
  }
  getClient() {
    return this.redis;
  }
}
