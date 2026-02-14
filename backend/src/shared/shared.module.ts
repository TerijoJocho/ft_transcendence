import { Module, Global } from '@nestjs/common';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './services/redis.service';
import { DatabaseService } from './services/db.service';
import { UtilsService } from './services/utils.func.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        client: redisService.getClient(),
        ttl: 5,
        isGlobal: true,
      }),
    }),
  ],
  exports: [CacheModule, DatabaseService, RedisService, CacheInterceptor, UtilsService],
  providers:[DatabaseService, RedisService, CacheInterceptor, UtilsService],
})
export class SharedModule {}