const Redis = require('ioredis');
const { logger } = require('./logger');

// Configuration de la connexion Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: true
};

// Création du client Redis
const redisClient = new Redis(process.env.REDIS_URL || redisConfig);

// Gestion des événements de connexion
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

module.exports = { redisClient }; 