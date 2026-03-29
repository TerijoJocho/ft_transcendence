FROM vault:1.13.3
 
RUN apk update && apk add --no-cache curl vim jq

RUN mkdir -p /etc/vault/certs/ /vault/local-secrets /run/approle

COPY vault-config.hcl /vault/config/vault-config.hcl

COPY backend-policy.hcl /backend-policy.hcl

EXPOSE 8200

ENV VAULT_CACERT=/etc/vault/certs/vault-selfsigned.crt

COPY init.sh /init.sh

RUN chmod -R 755 /vault/local-secrets /run/approle && chmod -R 755 /etc/vault/certs

RUN chown -R 100:100 /run /vault/local-secrets /run/approle /etc/vault/certs /init.sh \
    && chmod +x /init.sh 

USER 100

CMD [ "./init.sh" ]