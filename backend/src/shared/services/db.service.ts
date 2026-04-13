import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as schema from '../db/schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  onModuleInit() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString)
      throw new Error('POSTGRES_URL environment variable is not defined');
    this.pool = new Pool({ connectionString });
    this.db = drizzle({ client: this.pool, schema });
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
  getDb() {
    return this.db;
  }
}
