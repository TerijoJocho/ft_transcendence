import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
// import { SigninModule } from './signin/signin.module';
import { GameModule } from './game/game.module';
import { FriendshipModule } from './friendship/friendship.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    // SigninModule,
    GameModule,
    FriendshipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
