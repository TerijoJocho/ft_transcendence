import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: ReturnType<typeof drizzle>;

  onModuleInit() {
    this.pool = new Pool({ connectionString: process.env.POSTGRES_URL! });
    this.db = drizzle({ client: this.pool });
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
  getDb() {
    return this.db;
  }
}