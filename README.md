# Restaurant Order Management Platform

Application de gestion des commandes pour restaurants et food trucks basée sur une architecture microservices.

## 🏗️ Architecture

Ce projet est construit selon une architecture microservices avec les composants suivants :

- **Frontend**: Application Next.js avec TypeScript et TailwindCSS
- **Microservice Utilisateurs**: Service Node.js/Express pour la gestion des utilisateurs
- **Microservice Commandes**: Service Node.js/Express pour la gestion des commandes et restaurants
- **Bases de données**: PostgreSQL dédiée pour chaque microservice
- **File d'attente**: Redis pour la gestion des notifications
- **Reverse Proxy**: NGINX pour le routage et l'équilibrage de charge

## 🛠️ Technologies utilisées

- **Frontend**: Next.js, TypeScript, TailwindCSS, React
- **Backend**: Node.js, Express
- **Bases de données**: PostgreSQL
- **File d'attente**: Redis avec Bull
- **Conteneurisation**: Docker & Docker Compose
- **Reverse Proxy**: NGINX

## 🚀 Installation et démarrage

### Prérequis

- Docker et Docker Compose installés sur votre machine
- Git pour cloner le dépôt

### Lancement

1. Clonez le dépôt :
   ```bash
   git clone <url-du-depot>
   cd restaurant-order-platform
   ```

2. Construisez et démarrez les conteneurs :
   ```bash
   docker-compose up -d
   ```

3. L'application est accessible à l'adresse :
   - Frontend: http://localhost:80
   - API Utilisateurs: http://localhost:80/api/users
   - API Commandes: http://localhost:80/api/orders

## 📊 Structure du projet

```
.
├── frontend/                  # Application Next.js (TypeScript)
├── backend/
│   ├── users_service/         # Microservice de gestion des utilisateurs
│   └── orders_service/        # Microservice de gestion des commandes
├── nginx/                     # Configuration du reverse proxy
├── config/                    # Scripts d'initialisation des bases de données
└── docker-compose.yml         # Configuration Docker Compose
```

## 🔐 Utilisateurs de test

L'application est préchargée avec les utilisateurs suivants :

- **Admin**: admin@restaurant.com / password123
- **Manager**: manager@restaurant.com / password123
- **Client**: customer@example.com / password123

## 📝 Fonctionnalités

- Inscription et connexion des utilisateurs
- Consultation des restaurants et de leurs menus
- Passage de commandes
- Suivi en temps réel des commandes
- Notifications sur les changements de statut des commandes
- Interface d'administration pour les restaurants

## 🧪 Tests

Pour exécuter les tests, lancez la commande suivante dans chaque répertoire de service :

```bash
docker-compose exec users_service npm test
docker-compose exec orders_service npm test
``` 



docker-compose down
rm -rf frontend/.next

docker-compose build

docker-compose up




utilsier le port 80 pour les requetes postman# Container_project
