import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client = createClient({ url: process.env.REDIS_URL! });

  async onModuleInit() {
    await this.client.connect();
  }
  async onModuleDestroy() {
    await this.client.quit();
  }
  getClient() {
    return this.client;
  }
}