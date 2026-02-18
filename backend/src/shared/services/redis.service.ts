import { Injectable } from '@nestjs/common';
import { createClient } from '@keyv/redis';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: ReturnType<typeof createClient>; 
  
  async onModuleInit() {
    this.redis = createClient({ url: process.env.REDIS_URL! });
    await this.redis.connect();
  }
  onModuleDestroy() {
    this.redis.destroy();
  }
  getClient() {
    return this.redis;
  }
}