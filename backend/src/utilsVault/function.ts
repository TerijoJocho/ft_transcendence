import fs from 'fs';
import axios from 'axios';
import https from 'https';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';

type VaultAppRoleLoginResponse = {
  auth?: {
    client_token?: string;
  };
  errors?: string[];
};

type VaultKvV2Response = {
  data: {
    data: {
      username: unknown;
      password: unknown;
    };
  };
};

type VaultAppSecretsResponse = {
  data: {
    data: {
      jwt_access_token_secret: string;
      jwt_refresh_token_secret: string;
      google_auth_client_id: string;
      google_auth_client_secret: string;
      redis_url: string;
      postgres_url: string;
    };
  };
};

export async function backTokenByApprole(
  httpsAgent: https.Agent,
  vaultAddr: string,
): Promise<string> {
  const roleIdPath = '/run/approle/backend_role_id';
  const secretIdPath = '/run/approle/backend_secret_id';

  while (!(fs.existsSync(roleIdPath) && fs.existsSync(secretIdPath))) {
    console.log('Waiting for AppRole credentials files...');
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  const roleId = fs.readFileSync(roleIdPath, 'utf-8').trim();
  const secretId = fs.readFileSync(secretIdPath, 'utf-8').trim();

  const response = await axios.post<VaultAppRoleLoginResponse>(
    `${vaultAddr.replace(/\/$/, '')}/v1/auth/approle/login`,
    {
      role_id: roleId,
      secret_id: secretId,
    },
    {
      httpsAgent,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    },
  );

  const token = response.data?.auth?.client_token;

  if (typeof token !== 'string' || token.length === 0)
    throw new Error('Vault login response missing auth.client_token');

  return token;
}

export async function loadDbCredentialsFromVault(
  httpsAgent: https.Agent,
  vaultAddr: string,
  backendToken: string,
): Promise<void> {
  const normalizedVaultAddr = vaultAddr.replace(/\/$/, '');

  try {
    const vaultResponse = await axios.get<VaultKvV2Response>(
      `${normalizedVaultAddr}/v1/secret/data/db`,
      {
        headers: {
          'X-Vault-Token': backendToken,
        },
        httpsAgent,
      },
    );

    const dbUsername = vaultResponse.data.data.data.username;
    const dbPassword = vaultResponse.data.data.data.password;

    if (typeof dbUsername !== 'string' || typeof dbPassword !== 'string') {
      throw new HttpException(
        'Invalid Vault DB secret format',
        HttpStatus.CONFLICT,
      );
    }

    process.env.DB_USERNAME = dbUsername;
    process.env.DB_PASSWORD = dbPassword;

    const existingPostgresUrl = process.env.POSTGRES_URL;
    if (existingPostgresUrl) {
      try {
        const url = new URL(existingPostgresUrl);
        url.username = dbUsername;
        url.password = dbPassword;
        process.env.POSTGRES_URL = url.toString();
        console.log(
          'Database credentials loaded from Vault and POSTGRES_URL updated',
        );
      } catch (urlError) {
        console.error(
          'POSTGRES_URL is set but invalid; could not inject Vault DB credentials:',
          urlError instanceof Error ? urlError.message : urlError,
        );
      }
    } else {
      console.warn(
        'POSTGRES_URL is not set; Vault DB credentials are loaded but not applied to a database URL.',
      );
    }
  } catch (err) {
    if (err instanceof HttpException) throw err;
    throw new Error(
      `Error fetching secrets from Vault: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export async function loadAppSecretsFromVault(
  httpsAgent: https.Agent,
  vaultAddr: string,
  backendToken: string,
): Promise<void> {
  try {
    if (!backendToken || !vaultAddr || !httpsAgent)
      throw new Error('Missing Vault connection data for app secrets load');

    const normalizedVaultAddr = vaultAddr.replace(/\/$/, '');

    const vaultResponse = await axios.get<VaultAppSecretsResponse>(
      `${normalizedVaultAddr}/v1/secret/data/app`,
      {
        headers: {
          'X-Vault-Token': backendToken,
        },
        httpsAgent,
      },
    );

    const jwt_access_token_secret =
      vaultResponse.data.data.data.jwt_access_token_secret;
    const jwt_refresh_token_secret =
      vaultResponse.data.data.data.jwt_refresh_token_secret;
    const google_auth_client_id =
      vaultResponse.data.data.data.google_auth_client_id;
    const google_auth_client_secret =
      vaultResponse.data.data.data.google_auth_client_secret;
    const redis_url =
      vaultResponse.data.data.data.redis_url;
    const postgres_url =
      vaultResponse.data.data.data.postgres_url;

    if (
      typeof jwt_access_token_secret !== 'string' ||
      typeof jwt_refresh_token_secret !== 'string' ||
      typeof google_auth_client_id !== 'string' ||
      typeof google_auth_client_secret !== 'string' ||
      typeof redis_url !== 'string' ||
      typeof postgres_url !== 'string'
    )
      throw new HttpException(
        'Invalid Vault app secret format',
        HttpStatus.CONFLICT,
      );

    process.env.JWT_ACCESS_TOKEN_SECRET = jwt_access_token_secret;
    process.env.JWT_REFRESH_TOKEN_SECRET = jwt_refresh_token_secret;
    process.env.GOOGLE_AUTH_CLIENT_ID = google_auth_client_id;
    process.env.GOOGLE_AUTH_CLIENT_SECRET = google_auth_client_secret;
    process.env.REDIS_URL = redis_url;
    process.env.POSTGRES_URL = postgres_url;
  } catch (error) {
    if (error instanceof HttpException) throw error;
    throw new InternalServerErrorException(
      `Error from loadAppSecretsFromVault: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
