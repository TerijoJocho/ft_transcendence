import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [], // SharedModule est Global, donc automatiquement disponible
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}