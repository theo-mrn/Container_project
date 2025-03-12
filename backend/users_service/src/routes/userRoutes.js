const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes protégées - nécessitent une authentification
router.use(authenticate);

// Route pour obtenir le profil de l'utilisateur courant
router.get('/profile', userController.getCurrentUser);

// Route pour mettre à jour le profil de l'utilisateur courant
router.put('/profile', userController.updateCurrentUser);

// Route pour changer le mot de passe de l'utilisateur courant
router.put('/change-password', userController.changePassword);

// Routes admin - nécessitent des privilèges d'administration
router.get('/', authorize(['admin']), userController.getAllUsers);
router.get('/:id', authorize(['admin']), userController.getUserById);
router.put('/:id', authorize(['admin']), userController.updateUser);
router.delete('/:id', authorize(['admin']), userController.deleteUser);

module.exports = router; 