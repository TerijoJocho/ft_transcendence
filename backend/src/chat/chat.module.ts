import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [JwtModule, SharedModule],
  providers: [ChatGateway],
})
export class ChatModule {}
