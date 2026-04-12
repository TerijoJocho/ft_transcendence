path "secret/data/db" {
  capabilities = ["read"]
}

path "secret/data/auth" {
  capabilities = ["read"]
}

path "secret/data/redis" {
  capabilities = ["read"]
}

path "transit/encrypt/totp-secrets" {
  capabilities = ["update"]
}

path "transit/decrypt/totp-secrets" {
  capabilities = ["update"]
}
