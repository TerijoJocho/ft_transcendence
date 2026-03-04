FROM node:20-alpine

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port du dev server Vite
EXPOSE 5173

# Lancer en mode dev avec hot-reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]