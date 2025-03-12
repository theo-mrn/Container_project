const userModel = require('../models/userModel');
const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

/**
 * Contrôleur pour la gestion des utilisateurs
 */
const userController = {
  /**
   * Récupérer tous les utilisateurs (admin)
   */
  async getAllUsers(req, res, next) {
    try {
      // Dans un contexte réel, cette méthode devrait implémenter la pagination
      const query = `
        SELECT id, email, first_name, last_name, phone, address, role, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
      
      const result = await userModel.dbClient.query(query);
      const users = result.rows;
      
      res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
          users
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Récupérer un utilisateur par ID (admin)
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await userModel.findById(id);
      
      if (!user) {
        throw new ApiError('User not found', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Récupérer le profil de l'utilisateur courant
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      
      const user = await userModel.findById(userId);
      
      if (!user) {
        throw new ApiError('User not found', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Mettre à jour un utilisateur (admin)
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Vérifier que l'utilisateur existe
      const user = await userModel.findById(id);
      
      if (!user) {
        throw new ApiError('User not found', 404);
      }
      
      // Mettre à jour l'utilisateur
      const updatedUser = await userModel.update(id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Mettre à jour le profil de l'utilisateur courant
   */
  async updateCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      // Ne pas autoriser la mise à jour du rôle
      if (updateData.role) {
        delete updateData.role;
      }
      
      // Mettre à jour l'utilisateur
      const updatedUser = await userModel.update(userId, updateData);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Changer le mot de passe de l'utilisateur courant
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Vérifier que les mots de passe sont fournis
      if (!currentPassword || !newPassword) {
        throw new ApiError('Current password and new password are required', 400);
      }
      
      // Récupérer l'utilisateur complet (avec le mot de passe)
      const user = await userModel.findByEmail(req.user.email);
      
      // Vérifier le mot de passe actuel
      const isAuthenticated = await userModel.authenticate(user.email, currentPassword);
      
      if (!isAuthenticated) {
        throw new ApiError('Current password is incorrect', 401);
      }
      
      // Changer le mot de passe
      await userModel.changePassword(userId, newPassword);
      
      res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Supprimer un utilisateur (admin)
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      // Vérifier que l'utilisateur existe
      const user = await userModel.findById(id);
      
      if (!user) {
        throw new ApiError('User not found', 404);
      }
      
      // Supprimer l'utilisateur
      await userModel.delete(id);
      
      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController; 