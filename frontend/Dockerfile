# On utilise la même base Node
FROM node:22-alpine

# Dossier de travail
WORKDIR /usr/src/app

# Copie des dépendances
COPY package*.json ./

# Installation
RUN npm install

# Copie du code source
COPY . .

# Port par défaut de Vite
EXPOSE 5173

# Lancement du serveur de dev
# --host est OBLIGATOIRE pour que Docker expose le port vers l'extérieur
CMD ["npm", "run", "dev", "--", "--host"]
