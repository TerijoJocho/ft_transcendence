FROM owasp/modsecurity-crs@sha256:34e0b3c7165b5ac46d8bcb944786d649d312ac4d5998b2070719705dbf084d60
# image épinglée sur un digest immuable afin de réduire le risque lié au tag mutable
# mettre à jour explicitement en tirant la nouvelle version et en remplaçant le digest
# ou :nginx tout court (vérifie si c'est alpine avec 'cat /etc/os-release')

USER root

# 1. Installation des outils nécessaires à l'exécution
RUN apk add --no-cache openssl

COPY conf/default.conf /etc/nginx/conf.d/default.conf
COPY conf/default.conf /etc/nginx/templates/conf.d/default.conf.template
COPY conf/modsec-login.conf /etc/nginx/modsecurity.d/modsec-login.conf

# 2. Création des certificats SSL (Grâce à openssl qu'on vient d'installer)
RUN mkdir -p /etc/nginx/certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/nginx-selfsigned.key \
    -out /etc/nginx/certs/nginx-selfsigned.crt \
    -subj "/C=FR/ST=Paris/L=Paris/O=42/OU=Student/CN=localhost"

RUN chown -R 101:101 /etc/nginx/certs /etc/nginx/conf.d /etc/nginx/modsecurity.d
EXPOSE 443

# 3. Retour à l'utilisateur sécurisé (souvent 'nginx' ou 101)
USER 101
