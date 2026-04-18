import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';
import {
  backTokenByApprole,
  loadDbCredentialsFromVault,
} from './utilsVault/function';

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
    await loadDbCredentialsFromVault(httpsAgent, vaultAddr, backendToken);
  } catch (err) {
    console.error(
      'Error fetching secrets from Vault:',
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
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
