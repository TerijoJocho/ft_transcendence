#!/bin/sh
set -eu

if [ -f /run/secrets/POSTGRES_USER ]; then
  POSTGRES_USER=$(cat /run/secrets/POSTGRES_USER)
fi

if [ -f /run/secrets/POSTGRES_PASSWORD ]; then
  POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD)
fi

if [ -f /run/secrets/JWT_ACCESS_TOKEN_SECRET ]; then
  JWT_ACCESS_TOKEN_SECRET=$(cat /run/secrets/JWT_ACCESS_TOKEN_SECRET)
fi

if [ -f /run/secrets/JWT_REFRESH_TOKEN_SECRET ]; then
  JWT_REFRESH_TOKEN_SECRET=$(cat /run/secrets/JWT_REFRESH_TOKEN_SECRET)
fi

if [ -f /run/secrets/GOOGLE_AUTH_CLIENT_ID ]; then
  GOOGLE_AUTH_CLIENT_ID=$(cat /run/secrets/GOOGLE_AUTH_CLIENT_ID)
fi

if [ -f /run/secrets/GOOGLE_AUTH_CLIENT_SECRET ]; then
  GOOGLE_AUTH_CLIENT_SECRET=$(cat /run/secrets/GOOGLE_AUTH_CLIENT_SECRET)
fi

: "${POSTGRES_USER:?missing}"
: "${POSTGRES_PASSWORD:?missing}"
: "${JWT_ACCESS_TOKEN_SECRET:?missing}"
: "${JWT_REFRESH_TOKEN_SECRET:?missing}"
: "${GOOGLE_AUTH_CLIENT_ID:?missing}"
: "${GOOGLE_AUTH_CLIENT_SECRET:?missing}"

# pour les permissions des volume sudo chmod 700 .vault-secrets .vault-secrets/core .vault-secrets/approle .vault-secrets/vault_certs
vault server -config=/vault/config/vault-config.hcl &

VAULT_PID=$!

echo "Waiting for Vault process startup..."

: "${VAULT_CACERT:=/etc/vault/certs/vault-selfsigned.crt}"
: "${VAULT_ADDR:=https://127.0.0.1:8200}"
export VAULT_CACERT
export VAULT_ADDR

if [ ! -s "$VAULT_CACERT" ]; then
  echo "Vault CA cert missing at $VAULT_CACERT"
  exit 1
fi

wait_for_vault() {
  attempts=0
  while true; do
    status_json=$(vault status -format=json 2>/tmp/vault_status_error.log || true)
    if [ -n "$status_json" ] && echo "$status_json" | jq -e '.initialized != null and .sealed != null' >/dev/null 2>&1; then
      echo "$status_json"
      return 0
    fi

    attempts=$((attempts + 1))
    if [ "$attempts" -ge 60 ]; then
      echo "Vault API did not become ready in time"
      cat /tmp/vault_status_error.log || true
      return 1
    fi

    sleep 1
  done
}

status=$(wait_for_vault)
initialized=$(echo "$status" | jq -r '.initialized // false')
sealed=$(echo "$status" | jq -r '.sealed // true')

if [ "$initialized" != "true" ]; then
  echo "Initializing Vault..."
  if ! vault operator init -key-shares=5 -key-threshold=3 -format=json > /tmp/vault_init.json; then
    echo "Vault init failed"
    exit 1
  fi

  export VAULT_TOKEN=$(jq -r '.root_token // empty' /tmp/vault_init.json)
  if [ -z "$VAULT_TOKEN" ]; then
    echo "Vault init succeeded but root_token is missing"
    cat /tmp/vault_init.json || true
    exit 1
  fi

  echo "$VAULT_TOKEN" > /vault/local-secrets/root_token
  export VAULT_UNSEAL_KEY_1=$(jq -r '.unseal_keys_hex[0] // empty' /tmp/vault_init.json)
  export VAULT_UNSEAL_KEY_2=$(jq -r '.unseal_keys_hex[1] // empty' /tmp/vault_init.json)
  export VAULT_UNSEAL_KEY_3=$(jq -r '.unseal_keys_hex[2] // empty' /tmp/vault_init.json)

  if [ -n "$VAULT_UNSEAL_KEY_1" ] && [ -n "$VAULT_UNSEAL_KEY_2" ] && [ -n "$VAULT_UNSEAL_KEY_3" ]; then
  echo "$VAULT_UNSEAL_KEY_1" > /vault/local-secrets/unseal_keys
  echo "$VAULT_UNSEAL_KEY_2" >> /vault/local-secrets/unseal_keys
  echo "$VAULT_UNSEAL_KEY_3" >> /vault/local-secrets/unseal_keys
  else
  echo "Error: Missing unseal keys, cannot store them in /vault/local-secrets/unseal_keys"
  exit 1
  fi

  vault operator unseal "$VAULT_UNSEAL_KEY_1"
  vault operator unseal "$VAULT_UNSEAL_KEY_2"
  vault operator unseal "$VAULT_UNSEAL_KEY_3"

  # VAULT_TOKEN is already exported; avoid `vault login` because it prints token details.
  vault policy write backend-policy /backend-policy.hcl
  
  if ! vault secrets list -format=json | jq -e 'has("secret/")' >/dev/null; then
    vault secrets enable -version=2 -path=secret kv
  fi
  if ! vault secrets list -format=json | jq -e 'has("transit/")' >/dev/null; then
    vault secrets enable transit
  fi
  vault write -f transit/keys/totp-secrets
  if [ -z "${POSTGRES_PASSWORD:-}" ] || [ -z "${POSTGRES_USER:-}" ]; then
    echo "Error: POSTGRES_USER and POSTGRES_PASSWORD must be set and non-empty before storing database credentials in Vault."
    exit 1
  fi
  vault kv put secret/db password="$POSTGRES_PASSWORD" username="$POSTGRES_USER"
  vault kv put secret/app \
    jwt_access_token_secret="${JWT_ACCESS_TOKEN_SECRET}" \
    jwt_refresh_token_secret="${JWT_REFRESH_TOKEN_SECRET}" \
    google_auth_client_id="${GOOGLE_AUTH_CLIENT_ID}" \
    google_auth_client_secret="${GOOGLE_AUTH_CLIENT_SECRET}"
    
  if ! vault auth list -format=json | jq -e 'has("approle/")' >/dev/null; then
    vault auth enable approle
  fi
  vault write auth/approle/role/backend \
    token_policies="backend-policy" \
    token_ttl="0" \
    token_max_ttl="0" \
    secret_id_ttl="0" \
    secret_id_num_uses=0

  vault read -format=json auth/approle/role/backend/role-id \
  | jq -r '.data.role_id' > /vault/approle/backend_role_id
  vault write -f -format=json auth/approle/role/backend/secret-id \
  | jq -r '.data.secret_id' > /vault/approle/backend_secret_id
  chmod 400 /vault/approle/backend_role_id /vault/approle/backend_secret_id
else

  if [ "$sealed" = "true" ]; then
    echo "Attempting to unseal using stored keys..."

    if [ -f /vault/local-secrets/unseal_keys ]; then
      for key in $(cat /vault/local-secrets/unseal_keys); do
        vault operator unseal "$key"
      done
    else
      echo "No unseal keys available, manual unseal required."
      exit 1
    fi
  fi

  ROOT_TOKEN=""
  if [ -f /vault/local-secrets/root_token ]; then
    ROOT_TOKEN=$(cat /vault/local-secrets/root_token)
  fi

  if [ -n "$ROOT_TOKEN" ] && VAULT_TOKEN="$ROOT_TOKEN" vault token lookup >/dev/null 2>&1; then
    echo "valid token found in init file, using it"
    export VAULT_TOKEN="$ROOT_TOKEN"
  else
    echo "root token invalide"
    exit 1
  fi
  if ! vault auth list -format=json | jq -e 'has("approle/")' >/dev/null; then
    vault auth enable approle
  fi
  vault policy write backend-policy /backend-policy.hcl

  if ! vault secrets list -format=json | jq -e 'has("secret/")' >/dev/null; then
    vault secrets enable -version=2 -path=secret kv
  fi
<<<<<<< HEAD
  vault kv put secret/db password="$POSTGRES_PASSWORD" username="$POSTGRES_USER"
  vault kv put secret/app \
    jwt_access_token_secret="${JWT_ACCESS_TOKEN_SECRET}" \
    jwt_refresh_token_secret="${JWT_REFRESH_TOKEN_SECRET}" \
    google_auth_client_id="${GOOGLE_AUTH_CLIENT_ID}" \
    google_auth_client_secret="${GOOGLE_AUTH_CLIENT_SECRET}"

=======
  if ! vault secrets list -format=json | jq -e 'has("transit/")' >/dev/null; then
    vault secrets enable transit
  fi
  if ! vault read transit/keys/totp-secrets >/dev/null 2>&1; then
    vault write -f transit/keys/totp-secrets
  fi
>>>>>>> main
  vault write auth/approle/role/backend \
  token_policies="backend-policy" \
  token_ttl="0" \
  token_max_ttl="0" \
  secret_id_ttl="0" \
  secret_id_num_uses=0
  if [ ! -f /vault/approle/backend_role_id ]; then
    vault read -format=json auth/approle/role/backend/role-id \
    | jq -r '.data.role_id' > /vault/approle/backend_role_id
  fi
  vault write -f -format=json auth/approle/role/backend/secret-id \
  | jq -r '.data.secret_id' > /vault/approle/backend_secret_id
  chmod 400 /vault/approle/backend_role_id /vault/approle/backend_secret_id
fi

wait $VAULT_PID