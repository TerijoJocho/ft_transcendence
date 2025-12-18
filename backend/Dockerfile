# On part d'une version légère de Node (Alpine Linux)
FROM node:22-alpine

# Création du dossier de travail dans le conteneur
WORKDIR /usr/src/app

# Copie des fichiers de dépendances (package.json et lockfile)
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Documentation du port (NestJS tourne sur le 3000 par défaut)
EXPOSE 3000

# Commande de démarrage en mode DEV (avec hot-reload)
CMD ["npm", "run", "start:dev"]
