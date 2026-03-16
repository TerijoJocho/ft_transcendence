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
  echo $VAULT_TOKEN > /run/secrets/root_token
  export VAULT_UNSEAL_KEY_1=$(jq -r '.unseal_keys_hex[0] // empty' /tmp/vault_init.json)
  export VAULT_UNSEAL_KEY_2=$(jq -r '.unseal_keys_hex[4] // empty' /tmp/vault_init.json)
  export VAULT_UNSEAL_KEY_3=$(jq -r '.unseal_keys_hex[2] // empty' /tmp/vault_init.json)

  if [ -n "$VAULT_UNSEAL_KEY_1" ] && [ -n "$VAULT_UNSEAL_KEY_2" ] && [ -n "$VAULT_UNSEAL_KEY_3" ]; then
  echo "$VAULT_UNSEAL_KEY_1" > /run/secrets/unseal_keys
  echo "$VAULT_UNSEAL_KEY_2" >> /run/secrets/unseal_keys
  echo "$VAULT_UNSEAL_KEY_3" >> /run/secrets/unseal_keys
  else
  echo "Error: Missing unseal keys, cannot store them in /run/secrets/unseal_keys"
  exit 1
  fi

  vault operator unseal "$VAULT_UNSEAL_KEY_1"
  vault operator unseal "$VAULT_UNSEAL_KEY_2"
  vault operator unseal "$VAULT_UNSEAL_KEY_3"

  vault login "$VAULT_TOKEN"
  vault policy write backend-policy /backend-policy.hcl
  if ! vault secrets list -format=json | jq -e 'has("secret/")' >/dev/null; then
    vault secrets enable -version=2 -path=secret kv
  fi
  vault kv put secret/db password=$POSTGRES_PASSWORD username=$POSTGRES_USER

  vault token create -policy="backend-policy" -format=json > /tmp/vault_backend_token.json
  export BACKEND_TOKEN=$(jq -r '.auth.client_token // empty' /tmp/vault_backend_token.json)
  echo $BACKEND_TOKEN > /run/secrets/backend_token

else

  if [ "$sealed" = "true" ]; then
    echo "Attempting to unseal using stored keys..."

    if [ -f /run/secrets/unseal_keys ]; then
      for key in $(cat /run/secrets/unseal_keys); do
        vault operator unseal "$key"
      done
    else
      echo "No unseal keys available, manual unseal required."
      exit 1
    fi
  fi

  if [ -f /run/secrets/root_token ]; then
    ROOT_TOKEN=$(cat /run/secrets/root_token)
  fi
  if [ -n "$ROOT_TOKEN" ] && VAULT_TOKEN="$ROOT_TOKEN" vault token lookup >/dev/null 2>&1; then
    echo "valid token found in init file, using it"
    vault login "$ROOT_TOKEN"
  else
    echo "token in init file is invalid, checking for token in /run/secrets/backend_token..."
    exit 1
  fi

  if [ -f /run/secrets/backend_token ]; then
    BACKEND_TOKEN="$(cat /run/secrets/backend_token)"
  fi

  if VAULT_TOKEN="$BACKEND_TOKEN" vault token lookup >/dev/null 2>&1; then
    echo "valid token found"
  else
    echo "invalid token, creating new one"
    vault token create -policy="backend-policy" -format=json > /tmp/vault_backend_token.json
    BACKEND_TOKEN=$(jq -r '.auth.client_token // empty' /tmp/vault_backend_token.json)
    echo $BACKEND_TOKEN > /run/secrets/backend_token
  fi
fi

wait $VAULT_PID