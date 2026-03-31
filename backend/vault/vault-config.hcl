ui            = true
cluster_addr  = "https://vault:8201"
api_addr      = "https://vault:8200"
disable_mlock = true

storage "file" {
  path = "/vault/data"
  node_id = "file_node_id"
}

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/etc/vault/certs/vault-selfsigned.crt"
  tls_key_file  = "/etc/vault/certs/vault-selfsigned.key"
}
