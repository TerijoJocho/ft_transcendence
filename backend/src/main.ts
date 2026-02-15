import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, 
    { cors: { 
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // frontend
        credentials: true, // IMPORTANT pour cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],} 
    }
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  // Si le serveur ne démarre pas, on tue le processus pour que Docker le redémarre
  process.exit(1);
});
