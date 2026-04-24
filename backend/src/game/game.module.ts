import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

@Module({
  imports: [JwtModule],
  controllers: [GameController],
  providers: [GameService, GameGateway],
})
export class GameModule {}
