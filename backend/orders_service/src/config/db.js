const { Pool } = require('pg');
const { logger } = require('./logger');

// Configuration de la connexion à PostgreSQL
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Création du client de base de données
const dbClient = new Pool(dbConfig);

// Test de connexion à la base de données
dbClient.on('connect', () => {
  logger.info('Database connection established');
});

dbClient.on('error', (err) => {
  logger.error('Database connection error:', err);
});

module.exports = { dbClient }; 