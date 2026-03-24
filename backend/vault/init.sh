#!/bin/sh

vault server -config=/vault/config/vault-config.hcl &

VAULT_PID=$!

echo "⏳ Attente de 5 secondes..."
sleep 5

export VAULT_CACERT=/etc/vault/certs/vault-selfsigned.crt
export VAULT_ADDR='https://127.0.0.1:8200'

vault operator init -format=json > /tmp/vault_init.json

export VAULT_ROOT_TOKEN=$(jq -r '.root_token // empty' /tmp/vault_init.json)
export VAULT_UNSEAL_KEY_1=$(jq -r '.unseal_keys_hex[0] // empty' /tmp/vault_init.json)
export VAULT_UNSEAL_KEY_2=$(jq -r '.unseal_keys_hex[4] // empty' /tmp/vault_init.json)
export VAULT_UNSEAL_KEY_3=$(jq -r '.unseal_keys_hex[2] // empty' /tmp/vault_init.json)

vault operator unseal "$VAULT_UNSEAL_KEY_1"
vault operator unseal "$VAULT_UNSEAL_KEY_2"
vault operator unseal "$VAULT_UNSEAL_KEY_3"

vault login "$VAULT_ROOT_TOKEN"

vault policy write backend-policy /backend-policy.hcl

vault enable -path=secret kv-v2

vault kv put secret/db password=$POSTGRES_PASSWORD username=$POSTGRES_USER

vault token create -policy="backend-policy" -format=json > /tmp/vault_backend_token.json

export BACKEND_TOKEN=$(jq -r '.auth.client_token // empty' /tmp/vault_backend_token.json)

echo $BACKEND_TOKEN > /vault/secrets/backend_token

wait $VAULT_PID