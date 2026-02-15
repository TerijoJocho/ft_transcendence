FROM owasp/modsecurity-crs:nginx-alpine
# ou :nginx tout court (vérifie si c'est alpine avec 'cat /etc/os-release')

USER root

# 1. Installation des outils
RUN apk update && apk add --no-cache openssl curl vim
RUN apk update && apk upgrade

COPY conf/default.conf /etc/nginx/conf.d/default.conf
COPY conf/default.conf /etc/nginx/templates/conf.d/default.conf.template

# 2. Création des certificats SSL (Grâce à openssl qu'on vient d'installer)
RUN mkdir -p /etc/nginx/certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/nginx-selfsigned.key \
    -out /etc/nginx/certs/nginx-selfsigned.crt \
    -subj "/C=FR/ST=Paris/L=Paris/O=42/OU=Student/CN=localhost"

RUN chown -R 101:101 /etc/nginx/certs /etc/nginx/conf.d
EXPOSE 443

# 3. Retour à l'utilisateur sécurisé (souvent 'nginx' ou 101)
USER 101
