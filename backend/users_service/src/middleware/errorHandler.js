const { logger } = require('../config/logger');

/**
 * Middleware de gestion globale des erreurs
 */
const errorHandler = (err, req, res, next) => {
  // Journalisation de l'erreur
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Détermination du code d'erreur
  const statusCode = err.statusCode || 500;
  
  // Réponse au client
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    // En développement, on peut renvoyer la stack trace
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Classe d'erreur API personnalisée
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, ApiError }; 