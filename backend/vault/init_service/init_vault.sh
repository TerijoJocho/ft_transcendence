#!/bin/sh
set -eu

TARGET_UID="${LOCAL_UID:-1000}"
TARGET_GID="${LOCAL_GID:-1000}"

# Prepare Vault volume directories and permissions.
mkdir -p /vault/data /vault/local-secrets /vault/approle /certs
chown -R "$TARGET_UID":"$TARGET_GID" /vault/data /vault/local-secrets /vault/approle
chmod 777 /vault/local-secrets /vault/approle
find /vault/approle -type f -exec chmod 777 {} + || true
chmod 600 /vault/local-secrets/root_token /vault/local-secrets/unseal_keys 2>/dev/null || true

# Generate certs if missing, with proper permissions for user 100 to read
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /certs/vault-selfsigned.key \
  -out /certs/vault-selfsigned.crt \
  -subj '/C=FR/ST=Paris/L=Paris/O=42/OU=Student/CN=vault' \
  -addext 'subjectAltName=DNS:vault,IP:127.0.0.1'

# Fix permissions so Vault runtime user (LOCAL_UID/LOCAL_GID) can read certs
chown "$TARGET_UID":"$TARGET_GID" /certs/vault-selfsigned.* 2>/dev/null || true
chmod 644 /certs/vault-selfsigned.crt 2>/dev/null || true
chmod 644 /certs/vault-selfsigned.key 2>/dev/null || true

echo "Vault volume and cert preparation complete."
