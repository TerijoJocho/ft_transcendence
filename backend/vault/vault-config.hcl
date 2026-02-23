ui            = true
cluster_addr  = "http://vault:8201"
api_addr      = "http://vault:8200"
disable_mlock = true

storage "raft" {
  path = "/vault/file"
  node_id = "raft_node_id"
}

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_disable = 1
}
