require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { logger } = require('./config/logger');
const bookingRoutes = require('./routes/Booking');
const restaurantRoutes = require('./routes/restaurantRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { dbClient } = require('./config/db');
const { setupQueues } = require('./queues');

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 5002;

// Middlewares de base
app.use(express.json()); // Parsing du JSON
app.use(helmet()); // Sécurité HTTP

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Journalisation des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  logger.debug('Request headers:', req.headers);
  next();
});

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/restaurants', restaurantRoutes);

// Route de test/santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'orders-service' });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

const waitForDatabase = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      await dbClient.connect();
      logger.info('Connected to PostgreSQL database');
      return;
    } catch (err) {
      retries -= 1;
      logger.warn(`Database not ready, retrying in ${delay / 1000} seconds...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to connect to the database after multiple attempts');
};

const start = async () => {
  try {
    // Attente de la disponibilité de la base de données
    await waitForDatabase();

    // Configuration des files d'attente
    await setupQueues();
    logger.info('Message queues initialized');

    // Démarrage du serveur
    app.listen(PORT, () => {
      logger.info(`Orders service running on port ${PORT}`);
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