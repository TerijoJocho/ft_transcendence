import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { SigninModule } from './signin/signin.module';
import { GameModule } from './game/game.module';
import { FriendshipModule } from './friendship/friendship.module';
import { DoubleFactorModule } from './double_factor/double_factor.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    SigninModule,
    GameModule,
    FriendshipModule,
    DoubleFactorModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
