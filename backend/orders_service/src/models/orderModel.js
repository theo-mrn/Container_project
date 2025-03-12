const { dbClient } = require('../config/db');
const { logger } = require('../config/logger');
const { queueOrderNotification } = require('../queues');

class OrderModel {
  /**
   * Créer une nouvelle commande
   */
  async create(orderData) {
    const client = await dbClient.connect();
    
    try {
      // Démarrer une transaction
      await client.query('BEGIN');
      
      // Insérer la commande principale
      const orderQuery = `
        INSERT INTO orders (user_id, restaurant_id, status, total_amount, address, phone, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const orderValues = [
        orderData.user_id,
        orderData.restaurant_id,
        orderData.status || 'pending',
        orderData.total_amount,
        orderData.address,
        orderData.phone,
        orderData.notes || null
      ];
      
      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];
      
      // Insérer les éléments de la commande
      const orderItems = [];
      
      for (const item of orderData.items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        
        const itemValues = [
          order.id,
          item.menu_item_id,
          item.quantity,
          item.unit_price,
          item.notes || null
        ];
        
        const itemResult = await client.query(itemQuery, itemValues);
        orderItems.push(itemResult.rows[0]);
      }
      
      // Valider la transaction
      await client.query('COMMIT');
      
      // Ajouter une notification à la file d'attente
      await queueOrderNotification({
        orderId: order.id,
        type: 'order_created',
        message: `Nouvelle commande #${order.id} créée`,
        userId: order.user_id
      });
      
      return {
        ...order,
        items: orderItems
      };
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await client.query('ROLLBACK');
      logger.error('Error creating order:', error);
      throw error;
    } finally {
      // Libérer le client
      client.release();
    }
  }

  /**
   * Récupérer une commande par son ID avec ses éléments
   */
  async findById(id) {
    try {
      // Récupérer la commande
      const orderQuery = 'SELECT * FROM orders WHERE id = $1';
      const orderResult = await dbClient.query(orderQuery, [id]);
      const order = orderResult.rows[0];
      
      if (!order) {
        return null;
      }
      
      // Récupérer les éléments de la commande
      const itemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';
      const itemsResult = await dbClient.query(itemsQuery, [id]);
      
      return {
        ...order,
        items: itemsResult.rows
      };
    } catch (error) {
      logger.error(`Error finding order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les commandes d'un utilisateur
   */
  async findByUserId(userId) {
    try {
      const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await dbClient.query(query, [userId]);
      
      return result.rows;
    } catch (error) {
      logger.error(`Error finding orders for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les commandes d'un restaurant
   */
  async findByRestaurantId(restaurantId) {
    try {
      const query = 'SELECT * FROM orders WHERE restaurant_id = $1 ORDER BY created_at DESC';
      const result = await dbClient.query(query, [restaurantId]);
      
      return result.rows;
    } catch (error) {
      logger.error(`Error finding orders for restaurant ${restaurantId}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateStatus(id, status) {
    try {
      const query = `
        UPDATE orders
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await dbClient.query(query, [status, id]);
      const updatedOrder = result.rows[0];
      
      if (!updatedOrder) {
        return null;
      }
      
      // Ajouter une notification à la file d'attente
      await queueOrderNotification({
        orderId: id,
        type: `order_${status}`,
        message: `Statut de la commande #${id} mis à jour: ${status}`,
        userId: updatedOrder.user_id
      });
      
      return updatedOrder;
    } catch (error) {
      logger.error(`Error updating status for order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les notifications d'une commande
   */
  async getNotifications(orderId) {
    try {
      const query = `
        SELECT * FROM notifications
        WHERE order_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await dbClient.query(query, [orderId]);
      return result.rows;
    } catch (error) {
      logger.error(`Error fetching notifications for order ${orderId}:`, error);
      throw error;
    }
  }
}

module.exports = new OrderModel(); 