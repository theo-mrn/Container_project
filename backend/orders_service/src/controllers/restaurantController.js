const restaurantModel = require('../models/restaurantModel');
const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

/**
 * Contrôleur pour la gestion des restaurants et des menus
 */
const restaurantController = {
  /**
   * Créer un nouveau restaurant
   */
  async createRestaurant(req, res, next) {
    try {
      const restaurantData = req.body;
      
      // Vérifier les données requises
      if (!restaurantData.name || !restaurantData.description || 
          !restaurantData.cuisine || !restaurantData.location) {
        throw new ApiError('Missing required restaurant data', 400);
      }
      
      // Créer le restaurant
      const newRestaurant = await restaurantModel.create(restaurantData);
      
      res.status(201).json({
        status: 'success',
        data: {
          restaurant: newRestaurant
        }
      });
    } catch (error) {
      logger.error(`Error creating restaurant: ${error.message}`);
      next(error);
    }
  },

  /**
   * Récupérer tous les restaurants
   */
  async getAllRestaurants(req, res, next) {
    try {
      const restaurants = await restaurantModel.findAll();
      
      res.status(200).json({
        status: 'success',
        results: restaurants.length,
        data: {
          restaurants
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupérer un restaurant par son ID
   */
  async getRestaurantById(req, res, next) {
    try {
      const { id } = req.params;
      const restaurant = await restaurantModel.findById(id);
      
      if (!restaurant) {
        throw new ApiError('Restaurant not found', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          restaurant
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupérer le menu complet d'un restaurant
   */
  async getRestaurantMenu(req, res, next) {
    try {
      const { id } = req.params;
      const menu = await restaurantModel.getFullMenu(id);
      
      if (!menu) {
        throw new ApiError('Restaurant not found', 404);
      }
      
      res.status(200).json(menu);
    } catch (error) {
      logger.error(`Error in getRestaurantMenu: ${error.message}`);
      next(error);
    }
  },

  /**
   * Récupérer les catégories de menu d'un restaurant
   */
  async getMenuCategories(req, res, next) {
    try {
      const { id } = req.params;
      
      // Vérifier que le restaurant existe
      const restaurant = await restaurantModel.findById(id);
      
      if (!restaurant) {
        throw new ApiError('Restaurant not found', 404);
      }
      
      const categories = await restaurantModel.findCategories(id);
      
      res.status(200).json({
        status: 'success',
        results: categories.length,
        data: {
          categories
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupérer les plats d'une catégorie
   */
  async getCategoryItems(req, res, next) {
    try {
      const { categoryId } = req.params;
      const items = await restaurantModel.findMenuItems(categoryId);
      
      res.status(200).json({
        status: 'success',
        results: items.length,
        data: {
          items
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupérer un plat par son ID
   */
  async getMenuItemById(req, res, next) {
    try {
      const { itemId } = req.params;
      const item = await restaurantModel.findMenuItem(itemId);
      
      if (!item) {
        throw new ApiError('Menu item not found', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          item
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mettre à jour un restaurant
   */
  async updateRestaurant(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Vérifier que le restaurant existe
      const existingRestaurant = await restaurantModel.findById(id);
      if (!existingRestaurant) {
        throw new ApiError('Restaurant not found', 404);
      }
      
      // Mettre à jour le restaurant
      const updatedRestaurant = await restaurantModel.update(id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: {
          restaurant: updatedRestaurant
        }
      });
    } catch (error) {
      logger.error(`Error updating restaurant: ${error.message}`);
      next(error);
    }
  },

  /**
   * Créer une nouvelle catégorie de menu
   */
  async createMenuCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      
      // Vérifier que le restaurant existe
      const restaurant = await restaurantModel.findById(id);
      
      if (!restaurant) {
        throw new ApiError('Restaurant not found', 404);
      }
      
      // Vérifier les données requises
      if (!categoryData.name) {
        throw new ApiError('Category name is required', 400);
      }
      
      const category = await restaurantModel.createCategory(id, categoryData);
      
      res.status(201).json({
        status: 'success',
        data: {
          category
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = restaurantController; 