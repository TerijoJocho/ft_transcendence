import dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Retire tout champ qui n'est pas dans le DTO (Sécurité++)
      forbidNonWhitelisted: true, // Renvoie une erreur si un champ inconnu est envoyé
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // frontend
    credentials: true, // IMPORTANT pour cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  // Si le serveur ne démarre pas, on tue le processus pour que Docker le redémarre
  process.exit(1);
});
