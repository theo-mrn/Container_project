const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Route de connexion
router.post('/login', authController.login);

// Route d'inscription
router.post('/register', authController.register);

// Route de vérification du token
router.get('/verify', authenticate, authController.verifyToken);

// Route de rafraîchissement du token
router.post('/refresh-token', authController.refreshToken);

// Route de déconnexion
router.post('/logout', authenticate, authController.logout);

module.exports = router; 