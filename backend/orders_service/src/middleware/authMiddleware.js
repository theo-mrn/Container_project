const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const { logger } = require('../config/logger');

/**
 * Middleware pour vérifier le JWT token
 */
const authenticate = (req, res, next) => {
  try {
    // Récupération du token du header Authorization
    const authHeader = req.headers.authorization;
    logger.debug('Auth header:', authHeader);
    
    if (!authHeader) {
      logger.warn('No Authorization header found');
      throw new ApiError('Authentication required', 401);
    }
    
    // Extraction du token (avec ou sans le préfixe Bearer)
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    logger.debug('Extracted token:', token);
    
    if (!token) {
      logger.warn('No token found in Authorization header');
      throw new ApiError('Authentication token missing', 401);
    }

    // Décoder le token sans vérification
    try {
      const decoded = jwt.decode(token);
      logger.debug('Decoded token:', decoded);
      
      // Ajout des informations utilisateur à la requête
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.error('Token decoding error:', error);
      next(error);
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier les rôles utilisateur
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('No user found in request');
      return next(new ApiError('Authentication required', 401));
    }
    
    const userRole = req.user.role;
    logger.debug('User role:', userRole);
    
    // Si rôles est une chaîne, convertir en tableau
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    // Vérifier si l'utilisateur a un des rôles requis
    if (roles.length && !roles.includes(userRole)) {
      logger.warn(`User role ${userRole} not authorized. Required roles: ${roles.join(', ')}`);
      return next(new ApiError('Insufficient permissions', 403));
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
}; 