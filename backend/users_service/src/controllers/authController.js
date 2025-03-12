const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * Contrôleur pour la gestion de l'authentification
 */
const authController = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(req, res, next) {
    try {
      const { email, password, first_name, last_name, phone, address } = req.body;
      
      // Vérifier si l'email existe déjà
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        throw new ApiError('Email already in use', 400);
      }
      
      // Créer le nouvel utilisateur
      const newUser = await userModel.create({
        email,
        password,
        first_name,
        last_name,
        phone,
        address,
        role: 'customer' // rôle par défaut
      });
      
      // Générer un token
      const token = generateToken(newUser);
      
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Connexion d'un utilisateur
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      // Vérifier les identifiants
      const user = await userModel.authenticate(email, password);
      
      if (!user) {
        throw new ApiError('Invalid credentials', 401);
      }
      
      // Générer un token
      const token = generateToken(user);
      
      res.status(200).json({
        status: 'success',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Vérification du token
   */
  async verifyToken(req, res) {
    // Le middleware authenticate a déjà vérifié le token
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  },
  
  /**
   * Rafraîchissement du token
   */
  async refreshToken(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new ApiError('Token is required', 400);
      }
      
      // Vérifier le token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          // Si le token est expiré, on peut quand même l'utiliser pour en générer un nouveau
          decoded = jwt.decode(token);
        } else {
          throw new ApiError('Invalid token', 401);
        }
      }
      
      // Récupérer l'utilisateur
      const user = await userModel.findById(decoded.id);
      
      if (!user) {
        throw new ApiError('User not found', 404);
      }
      
      // Générer un nouveau token
      const newToken = generateToken(user);
      
      res.status(200).json({
        status: 'success',
        data: {
          token: newToken
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Déconnexion d'un utilisateur
   */
  async logout(req, res) {
    // En stateless JWT, la déconnexion est gérée côté client
    // On peut optionnellement ajouter le token à une blacklist
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  }
};

module.exports = authController; 