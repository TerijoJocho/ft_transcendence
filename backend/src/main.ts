import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import axios from 'axios';
import https from 'https';

type VaultKvV2Response = {
  data: {
    data: {
      username: unknown;
      password: unknown;
    };
  };
};

async function bootstrap() {
  const tokenPath = '/run/secrets/backend_token';
  const vaultCaCertPath = process.env.VAULT_CACERT;
  const vaultSkipVerify = process.env.VAULT_SKIP_VERIFY === 'true';

  let httpsAgent: https.Agent | undefined;

  if (vaultSkipVerify) {
    console.warn(
      'VAULT_SKIP_VERIFY=true: TLS certificate verification is disabled (dev only).',
    );
    httpsAgent = new https.Agent({ rejectUnauthorized: false });
  } else if (vaultCaCertPath && fs.existsSync(vaultCaCertPath)) {
    httpsAgent = new https.Agent({
      ca: fs.readFileSync(vaultCaCertPath),
      rejectUnauthorized: true,
    });
  } else {
    console.warn(
      'Vault CA cert not found. Set VAULT_CACERT or enable VAULT_SKIP_VERIFY in dev.',
    );
  }

  while (!fs.existsSync(tokenPath)) {
    console.log(
      'waiting file for VAULT_TOKEN to be set in environment variables',
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const vaultToken = fs.readFileSync(tokenPath, 'utf-8').trim();
  process.env.VAULT_TOKEN = vaultToken;
  console.log('VAULT_TOKEN loaded from Docker secrets');

  try {
    const vaultResponse = await axios.get<VaultKvV2Response>(
      `https://vault:8200/v1/secret/data/db`,
      {
        headers: {
          'X-Vault-Token': vaultToken,
        },
        httpsAgent,
      },
    );
    const dbUsername = vaultResponse.data.data.data.username;
    const dbPassword = vaultResponse.data.data.data.password;
    if (typeof dbUsername !== 'string' || typeof dbPassword !== 'string') {
      throw new Error('Invalid Vault DB secret format');
    }
    process.env.DB_USERNAME = dbUsername;
    process.env.DB_PASSWORD = dbPassword;
    console.log('Database credentials loaded from Vault');
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
