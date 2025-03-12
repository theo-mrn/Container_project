require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { logger } = require('./config/logger');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { dbClient } = require('./config/db');

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(helmet()); // Sécurité HTTP
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));   // Gestion des Cross-Origin Resource Sharing
app.use(express.json()); // Parsing du JSON

// Journalisation des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Route de test/santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'users-service' });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
const start = async () => {
  try {
    // Connexion à la base de données
    await dbClient.connect();
    logger.info('Connected to PostgreSQL database');

    // Démarrage du serveur
    app.listen(PORT, () => {
      logger.info(`Users service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Gestion de la fermeture propre
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await dbClient.end();
  process.exit(0);
});

// Démarrage de l'application
start(); 