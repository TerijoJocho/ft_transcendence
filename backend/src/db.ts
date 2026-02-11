import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { createClient } from 'redis';

export const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });
export const db = drizzle({ client: pool });
export const cache = createClient({ url: process.env.REDIS_URL! });


