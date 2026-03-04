import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, 
    { cors: { 
        origin: [
          'https://localhost',
          'https://127.0.0.1',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
        ],
        credentials: true, // IMPORTANT pour cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],} 
    }
  );
  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  // Si le serveur ne démarre pas, on tue le processus pour que Docker le redémarre
  process.exit(1);
});
