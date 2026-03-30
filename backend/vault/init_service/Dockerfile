FROM alpine:3.20

RUN apk add --no-cache openssl

COPY init_vault.sh /usr/local/bin/init_vault.sh
RUN chmod +x /usr/local/bin/init_vault.sh

CMD ["/usr/local/bin/init_vault.sh"]
