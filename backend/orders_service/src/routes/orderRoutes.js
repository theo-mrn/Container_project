const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes de l'utilisateur
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);

// Routes pour récupérer une commande spécifique et ses notifications
router.get('/:id', orderController.getOrderById);
router.get('/:id/notifications', orderController.getOrderNotifications);

// Routes admin/manager
router.get('/restaurant/:restaurantId', authorize(['admin', 'restaurant_manager']), orderController.getRestaurantOrders);
router.put('/:id/status', authorize(['admin', 'restaurant_manager']), orderController.updateOrderStatus);

module.exports = router; 