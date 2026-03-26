#!/bin/sh
vault server -config=/vault/config/vault-config.hcl &

VAULT_PID=$!

echo "⏳ Attente de 5 secondes..."
sleep 5

export VAULT_CACERT=/etc/vault/certs/vault-selfsigned.crt
export VAULT_ADDR='https://vault:8200'

status=$(vault status -format=json || true)
initialized=$(echo "$status" | jq -r '.initialized')
sealed=$(echo "$status" | jq -r '.sealed')

if [ "$initialized" != "true" ]; then
  echo "Initializing Vault..."
  vault operator init -key-shares=5 -key-threshold=3 -format=json > /tmp/vault_init.json

  export VAULT_TOKEN=$(jq -r '.root_token // empty' /tmp/vault_init.json)
  echo $VAULT_TOKEN > /run/root_token
  export VAULT_UNSEAL_KEY_1=$(jq -r '.unseal_keys_hex[0] // empty' /tmp/vault_init.json)
  export VAULT_UNSEAL_KEY_2=$(jq -r '.unseal_keys_hex[4] // empty' /tmp/vault_init.json)
  export VAULT_UNSEAL_KEY_3=$(jq -r '.unseal_keys_hex[2] // empty' /tmp/vault_init.json)

  if [ -n "$VAULT_UNSEAL_KEY_1" ] && [ -n "$VAULT_UNSEAL_KEY_2" ] && [ -n "$VAULT_UNSEAL_KEY_3" ]; then
  echo "$VAULT_UNSEAL_KEY_1" > run/unseal_keys
  echo "$VAULT_UNSEAL_KEY_2" >> run/unseal_keys
  echo "$VAULT_UNSEAL_KEY_3" >> run/unseal_keys
  else
  echo "Error: Missing unseal keys, cannot store them in /vault/unseal_keys"
  exit 1
  fi

  vault operator unseal "$VAULT_UNSEAL_KEY_1"
  vault operator unseal "$VAULT_UNSEAL_KEY_2"
  vault operator unseal "$VAULT_UNSEAL_KEY_3"

  # VAULT_TOKEN is already exported; avoid `vault login` because it prints token details.
  vault policy write backend-policy /backend-policy.hcl
  
  # if ! vault secrets list -format=json | jq -e 'has("secret/")' >/dev/null; then
  #   vault secrets enable -version=2 -path=secret kv
  # fi
  # vault kv put secret/db password=$POSTGRES_PASSWORD username=$POSTGRES_USER

  if ! vault auth list -format=json | jq -e 'has("approle/")' >/dev/null; then
    vault auth enable approle
  fi
  vault write auth/approle/role/backend \
    token_policies="backend-policy" \
    token_ttl="15m" \
    token_max_ttl="1h" \
    secret_id_ttl="24h" \
    secret_id_num_uses=0

  vault read -format=json auth/approle/role/backend/role-id \
  | jq -r '.data.role_id' > /run/approle/backend_role_id
  vault write -f -format=json auth/approle/role/backend/secret-id \
  | jq -r '.data.secret_id' > /run/approle/backend_secret_id
  chmod 400 /run/approle/backend_role_id /run/approle/backend_secret_id
else

  if [ "$sealed" = "true" ]; then
    echo "Attempting to unseal using stored keys..."

    if [ -f run/unseal_keys ]; then
      for key in $(cat run/unseal_keys); do
        vault operator unseal "$key"
      done
    else
      echo "No unseal keys available, manual unseal required."
      exit 1
    fi
  fi

  if [ -f run/root_token ]; then
    ROOT_TOKEN=$(cat run/root_token)
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
  if ! vault policy read backend-policy >/dev/null 2>&1; then
    vault policy write backend-policy /backend-policy.hcl
  fi
  vault write auth/approle/role/backend \
  token_policies="backend-policy" \
  token_ttl="15m" \
  token_max_ttl="1h" \
  secret_id_ttl="24h" \
  secret_id_num_uses=0
  if [ ! -f /run/approle/backend_role_id ]; then
    vault read -format=json auth/approle/role/backend/role-id \
    | jq -r '.data.role_id' > /run/approle/backend_role_id
  fi
  vault write -f -format=json auth/approle/role/backend/secret-id \
  | jq -r '.data.secret_id' > /run/approle/backend_secret_id
  chmod 400 /run/approle/backend_role_id /run/approle/backend_secret_id
fi

wait $VAULT_PID