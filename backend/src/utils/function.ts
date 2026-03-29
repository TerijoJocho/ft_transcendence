import fs from 'fs';
import axios from 'axios';
import https from 'https';

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

export async function backTokenByApprole(
  httpsAgent: https.Agent,
  vaultAddr: string,
): Promise<string> {
  const roleIdPath = '/run/approle/backend_role_id';
  const secretIdPath = '/run/approle/backend_secret_id';

  while (!(fs.existsSync(roleIdPath) && fs.existsSync(secretIdPath))) {
    console.log('Waiting for AppRole credentials files...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
      // timeout: 5000,
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
      throw new Error('Invalid Vault DB secret format');
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
    throw new Error(
      `Error fetching secrets from Vault: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
