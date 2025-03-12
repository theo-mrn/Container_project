FROM node:18-alpine AS base

# Arguments pour les variables d'environnement
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_API_URL
ARG NEXT_PUBLIC_RESTAURANT_API_URL
ARG NEXT_PUBLIC_ORDERS_API_URL
ARG NEXT_PUBLIC_DEBUG

# Configuration npm globale
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-timeout 600000 && \
    npm config set strict-ssl false

# Étape de développement
FROM base AS development
WORKDIR /app

# Définition des variables d'environnement
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AUTH_API_URL=${NEXT_PUBLIC_AUTH_API_URL}
ENV NEXT_PUBLIC_RESTAURANT_API_URL=${NEXT_PUBLIC_RESTAURANT_API_URL}
ENV NEXT_PUBLIC_ORDERS_API_URL=${NEXT_PUBLIC_ORDERS_API_URL}
ENV NEXT_PUBLIC_DEBUG=${NEXT_PUBLIC_DEBUG}

# Copie des fichiers de configuration
COPY package*.json ./
RUN npm install --no-audit --no-fund --network-timeout=600000 || \
    (sleep 5 && npm install --no-audit --no-fund --network-timeout=600000) || \
    (sleep 10 && npm install --no-audit --no-fund --network-timeout=600000)

# Copie du code source
COPY . .

# Commande par défaut pour le développement
CMD ["npm", "run", "dev"]

# Étape de build
FROM base AS builder
WORKDIR /app

# Définition des variables d'environnement pour le build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AUTH_API_URL=${NEXT_PUBLIC_AUTH_API_URL}
ENV NEXT_PUBLIC_RESTAURANT_API_URL=${NEXT_PUBLIC_RESTAURANT_API_URL}
ENV NEXT_PUBLIC_ORDERS_API_URL=${NEXT_PUBLIC_ORDERS_API_URL}
ENV NEXT_PUBLIC_DEBUG=${NEXT_PUBLIC_DEBUG}

# Copie des fichiers de configuration
COPY package*.json ./
RUN npm install --no-audit --no-fund --network-timeout=600000 || \
    (sleep 5 && npm install --no-audit --no-fund --network-timeout=600000) || \
    (sleep 10 && npm install --no-audit --no-fund --network-timeout=600000)

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production
FROM base AS production
WORKDIR /app

# Configurer les variables d'environnement
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AUTH_API_URL=${NEXT_PUBLIC_AUTH_API_URL}
ENV NEXT_PUBLIC_RESTAURANT_API_URL=${NEXT_PUBLIC_RESTAURANT_API_URL}
ENV NEXT_PUBLIC_ORDERS_API_URL=${NEXT_PUBLIC_ORDERS_API_URL}
ENV NEXT_PUBLIC_DEBUG=${NEXT_PUBLIC_DEBUG}

# Copie des fichiers de configuration
COPY package*.json ./
RUN npm install --only=production --no-audit --no-fund --network-timeout=600000 || \
    (sleep 5 && npm install --only=production --no-audit --no-fund --network-timeout=600000) || \
    (sleep 10 && npm install --only=production --no-audit --no-fund --network-timeout=600000)

# Copie des fichiers générés lors du build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"] 