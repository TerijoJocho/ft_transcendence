FROM vault:1.13.3
 
RUN apk update && apk add --no-cache curl openssl vim jq

RUN mkdir -p /etc/vault/certs/

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/vault/certs/vault-selfsigned.key \
    -out /etc/vault/certs/vault-selfsigned.crt \
    -subj "/C=FR/ST=Paris/L=Paris/O=42/OU=Student/CN=vault" \
    -addext "subjectAltName=DNS:vault,DNS:vault,IP:127.0.0.1"

COPY vault-config.hcl /vault/config/vault-config.hcl

COPY backend-policy.hcl /backend-policy.hcl

EXPOSE 8200

ENV VAULT_CACERT=/etc/vault/certs/vault-selfsigned.crt

COPY init.sh /init.sh

RUN mkdir -p /run/secrets/

RUN chown -R 100:100 /run /run/secrets /etc/vault/certs/vault-selfsigned.key /etc/vault/certs/vault-selfsigned.crt /init.sh \
    && chmod +x /init.sh 

USER 100

CMD [ "./init.sh" ]