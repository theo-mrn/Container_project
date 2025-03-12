FROM node:18-alpine

# Installation de curl pour le healthcheck
RUN apk add --no-cache curl

# Création du répertoire de travail
WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Exposition du port utilisé par l'application
EXPOSE 5002

# Commande pour démarrer l'application
CMD ["npm", "start"] 