#!/bin/sh
set -eu

TARGET_UID="${LOCAL_UID:-}"
TARGET_GID="${LOCAL_GID:-}"

if [ -z "$TARGET_UID" ] || [ -z "$TARGET_GID" ]; then
  if [ -d /workspace ]; then
    TARGET_UID="$(stat -c '%u' /workspace 2>/dev/null || true)"
    TARGET_GID="$(stat -c '%g' /workspace 2>/dev/null || true)"
  fi
fi

TARGET_UID="${TARGET_UID:-1000}"
TARGET_GID="${TARGET_GID:-1000}"

# Prepare Vault volume directories and permissions.
mkdir -p /vault/data /vault/local-secrets /vault/approle /certs

# Recreate a fresh Vault state so core/approle are generated on every start.
find /vault/data -mindepth 1 -exec rm -rf {} +
find /vault/local-secrets -mindepth 1 -exec rm -rf {} +
find /vault/approle -mindepth 1 -exec rm -rf {} +
find /certs -mindepth 1 -exec rm -rf {} +

# Re-apply ownership/permissions after cleanup.
chown -R "$TARGET_UID":"$TARGET_GID" /vault/data /vault/local-secrets /vault/approle
chmod 700 /vault/local-secrets /vault/approle
find /vault/approle -type f -exec chmod 600 {} + || true
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
