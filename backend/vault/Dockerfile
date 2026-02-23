FROM vault:1.13.3
 
RUN apk update && apk add --no-cache curl

COPY vault-config.hcl /vault/config/vault-config.hcl
COPY init.sh /vault 
CMD [ "vault", "server", "-config=/vault/config/vault-config.hcl" ]