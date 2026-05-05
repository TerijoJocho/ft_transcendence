import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [JwtModule, SharedModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
