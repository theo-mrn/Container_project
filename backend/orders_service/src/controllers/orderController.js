const orderModel = require('../models/orderModel');
const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

/**
 * Contrôleur pour la gestion des commandes
 */
const orderController = {
  /**
   * Créer une nouvelle commande
   */
  async createOrder(req, res, next) {
    try {
      const orderData = req.body;
      
      // Ajouter l'ID utilisateur depuis le token JWT
      orderData.user_id = req.user.id;
      
      // Vérifier les données requises
      if (!orderData.restaurant_id || !orderData.total_amount || 
          !orderData.address || !orderData.phone || !orderData.items || 
          !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new ApiError('Missing required order data', 400);
      }
      
      // Vérifier que tous les éléments de la commande ont les champs requis
      for (const item of orderData.items) {
        if (!item.menu_item_id || !item.quantity || !item.unit_price) {
          throw new ApiError('Missing required order item data', 400);
        }
      }
      
      // Créer la commande
      const newOrder = await orderModel.create(orderData);
      
      res.status(201).json({
        status: 'success',
        data: {
          order: newOrder
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupérer les commandes de l'utilisateur connecté
   */
  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await orderModel.findByUserId(userId);
      
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
          orders
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupérer les commandes d'un restaurant (pour les admin/manager)
   */
  async getRestaurantOrders(req, res, next) {
    try {
      const { restaurantId } = req.params;
      
      // Vérifier que l'utilisateur est admin ou manager
      if (req.user.role !== 'admin' && req.user.role !== 'restaurant_manager') {
        throw new ApiError('You are not authorized to access restaurant orders', 403);
      }
      
      const orders = await orderModel.findByRestaurantId(restaurantId);
      
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
          orders
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupérer une commande par son ID
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderModel.findById(id);
      
      if (!order) {
        throw new ApiError('Order not found', 404);
      }
      
      // Vérifier que l'utilisateur est autorisé à voir cette commande
      if (order.user_id !== req.user.id && 
          req.user.role !== 'admin' && 
          req.user.role !== 'restaurant_manager') {
        throw new ApiError('You are not authorized to access this order', 403);
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          order
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Vérifier que le statut est valide
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        throw new ApiError('Invalid order status', 400);
      }
      
      // Récupérer la commande pour vérifier les permissions
      const order = await orderModel.findById(id);
      
      if (!order) {
        throw new ApiError('Order not found', 404);
      }
      
      // Vérifier que l'utilisateur est autorisé à modifier cette commande
      if (req.user.role !== 'admin' && req.user.role !== 'restaurant_manager') {
        throw new ApiError('You are not authorized to update this order', 403);
      }
      
      // Mettre à jour le statut
      const updatedOrder = await orderModel.updateStatus(id, status);
      
      res.status(200).json({
        status: 'success',
        data: {
          order: updatedOrder
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Récupérer les notifications d'une commande
   */
  async getOrderNotifications(req, res, next) {
    try {
      const { id } = req.params;
      
      // Récupérer la commande pour vérifier les permissions
      const order = await orderModel.findById(id);
      
      if (!order) {
        throw new ApiError('Order not found', 404);
      }
      
      // Vérifier que l'utilisateur est autorisé à voir les notifications de cette commande
      if (order.user_id !== req.user.id && 
          req.user.role !== 'admin' && 
          req.user.role !== 'restaurant_manager') {
        throw new ApiError('You are not authorized to access this order', 403);
      }
      
      // Récupérer les notifications
      const notifications = await orderModel.getNotifications(id);
      
      res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: {
          notifications
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController; 