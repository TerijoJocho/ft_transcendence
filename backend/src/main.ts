import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { HttpException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';
import {
  backTokenByApprole,
  loadAppSecretsFromVault,
  loadDbCredentialsFromVault,
} from './utilsVault/function';

function logBootstrapError(context: string, error: unknown): never {
  if (error instanceof HttpException) {
    console.error(context, `status=${error.getStatus()}`, error.message);
  } else console.error(context, error instanceof Error ? error.message : error);
  process.exit(1);
}

async function bootstrap() {
  const vaultCaCertPath = process.env.VAULT_CACERT;
  const vaultAddr = (process.env.VAULT_ADDR ?? 'https://vault:8200').replace(
    /\/$/,
    '',
  );
  let httpsAgent: https.Agent | undefined;

  if (vaultCaCertPath && fs.existsSync(vaultCaCertPath)) {
    httpsAgent = new https.Agent({
      ca: fs.readFileSync(vaultCaCertPath),
      rejectUnauthorized: true,
    });
  } else {
    console.warn('Vault CA cert not found. Set VAULT_CACERT in dev.');
    process.exit(1);
  }

  const backendToken = await backTokenByApprole(httpsAgent, vaultAddr);
  if (typeof backendToken !== 'string' || backendToken.length === 0)
    throw new Error('Invalid Vault token');
  process.env.BACKEND_VAULT_TOKEN = backendToken;
  console.log('VAULT_TOKEN loaded from Vault by Approle');

  try {
    await loadAppSecretsFromVault(httpsAgent, vaultAddr, backendToken);
  } catch (err) {
    logBootstrapError('Error fetching app secrets from Vault:', err);
  }

  try {
    await loadDbCredentialsFromVault(httpsAgent, vaultAddr, backendToken);
  } catch (err) {
    logBootstrapError('Error fetching DB secrets from Vault:', err);
  }

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // frontend
      credentials: true, // IMPORTANT pour cookies
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    },
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
