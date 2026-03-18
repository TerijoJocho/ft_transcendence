import { Injectable } from '@nestjs/common';
import { and, asc, eq, or } from 'drizzle-orm';
import { DatabaseService } from '../shared/services/db.service';
import { messageTable } from '../shared/db/schema';

@Injectable()
export class ChatService {
  constructor(private db: DatabaseService) {}

  async saveMessage(senderId: number, receiverId: number, content: string) {
    const result = await this.db
      .getDb()
      .insert(messageTable)
      .values({ senderId, receiverId, content })
      .returning();
    return result[0];
  }

  async getMessageHistory(playerId1: number, playerId2: number, limit = 50) {
    // Récupère les messages entre deux joueurs
    const messages = await this.db
      .getDb()
      .select()
      .from(messageTable)
      .where(
        or(
          and(
            eq(messageTable.senderId, playerId1),
            eq(messageTable.receiverId, playerId2),
          ),
          and(
            eq(messageTable.senderId, playerId2),
            eq(messageTable.receiverId, playerId1),
          ),
        ),
      )
      .orderBy(asc(messageTable.sentAt))
      .limit(limit);
    return messages;
  }
}