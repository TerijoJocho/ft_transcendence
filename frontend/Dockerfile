# ---------- Stage 1 : Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Build Vite
RUN npm run build

# ---------- Stage 2 : Production ----------
FROM nginx:alpine

# Supprimer la config par défaut de nginx
RUN rm -rf /usr/share/nginx/html/*

# Créer la configuration Nginx pour une SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copier le build généré par Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]