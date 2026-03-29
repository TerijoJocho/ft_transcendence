#!/bin/sh
set -eu

# Prepare Vault volume directories and permissions.
mkdir -p /vault/data /vault/local-secrets /vault/approle /certs
chown -R 100:100 /vault/data /vault/local-secrets /vault/approle
chmod 700 /vault/local-secrets /vault/approle
find /vault/approle -type f -exec chmod 600 {} + || true
chmod 600 /vault/local-secrets/root_token /vault/local-secrets/unseal_keys 2>/dev/null || true

# Generate certs if missing, with proper permissions for user 100 to read
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /certs/vault-selfsigned.key \
  -out /certs/vault-selfsigned.crt \
  -subj '/C=FR/ST=Paris/L=Paris/O=42/OU=Student/CN=vault' \
  -addext 'subjectAltName=DNS:vault,IP:127.0.0.1'

# Fix permissions: user 100 must be able to read the cert and key
chown 100:100 /certs/vault-selfsigned.* 2>/dev/null || true
chmod 644 /certs/vault-selfsigned.crt 2>/dev/null || true
chmod 644 /certs/vault-selfsigned.key 2>/dev/null || true

echo "Vault volume and cert preparation complete."
