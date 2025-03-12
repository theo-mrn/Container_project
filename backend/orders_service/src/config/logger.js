const winston = require('winston');

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'orders-service' },
  transports: [
    // Écriture dans la console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
    // En production, on pourrait ajouter des transports pour écrire dans des fichiers
    // ou envoyer les logs à un service externe (ELK, Datadog, etc.)
  ]
});

module.exports = { logger }; 