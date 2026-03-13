import { Module, Global, ValidationPipe } from '@nestjs/common';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './services/redis.service';
import { DatabaseService } from './services/db.service';
import { UtilsService } from './services/utils.func.service';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports:[
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        client: redisService.getClient(),
        ttl: 5,
        isGlobal: true,
      }),
    }),
  ],
  exports:[DatabaseService, RedisService, CacheInterceptor, UtilsService],
  providers:[DatabaseService, RedisService, CacheInterceptor, UtilsService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
    },
  ],
})
export class SharedModule {}
