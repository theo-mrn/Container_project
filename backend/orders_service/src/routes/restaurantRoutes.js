const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes publiques (pas besoin d'authentification)
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/menu', restaurantController.getRestaurantMenu);
router.get('/:id/categories', restaurantController.getMenuCategories);
router.get('/categories/:categoryId/items', restaurantController.getCategoryItems);
router.get('/menu-items/:itemId', restaurantController.getMenuItemById);

// Routes protégées (nécessitent une authentification)
router.post('/', authenticate, restaurantController.createRestaurant);
router.put('/:id', authenticate, restaurantController.updateRestaurant);
router.post('/:id/categories', authenticate, restaurantController.createMenuCategory);

module.exports = router; 