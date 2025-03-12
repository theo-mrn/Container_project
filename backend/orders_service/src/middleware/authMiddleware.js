const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

/**
 * Middleware pour vérifier le JWT token
 */
const authenticate = (req, res, next) => {
  try {
    // Récupération du token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authentication required', 401);
    }
    
    // Extraction du token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError('Authentication token missing', 401);
    }
    
    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajout des informations utilisateur à la requête
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware pour vérifier les rôles utilisateur
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }
    
    const userRole = req.user.role;
    
    // Si rôles est une chaîne, convertir en tableau
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    // Vérifier si l'utilisateur a un des rôles requis
    if (roles.length && !roles.includes(userRole)) {
      return next(new ApiError('Insufficient permissions', 403));
    }
    
    next();
  };
};

module.exports = { authenticate, authorize }; 