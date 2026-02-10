import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config();
const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });
export const db = drizzle({ client: pool });
  
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
// Au lieu de juste bootstrap();
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  // Si le serveur ne démarre pas, on tue le processus pour que Docker le redémarre
  process.exit(1);
});
