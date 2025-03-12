const Queue = require('bull');
const { logger } = require('../config/logger');
const { processOrderNotification } = require('./orderNotificationProcessor');

// Configuration des files d'attente
const orderNotificationQueue = new Queue('order-notifications', process.env.REDIS_URL || 'redis://redis:6379');

// Configuration des événements de la file d'attente
orderNotificationQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed for order ${job.data.orderId}`);
});

orderNotificationQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed for order ${job.data.orderId}:`, err);
});

orderNotificationQueue.on('error', (error) => {
  logger.error('Queue error:', error);
});

// Configurer les processeurs pour les files d'attente
const setupQueues = async () => {
  // Processeur pour les notifications de commande
  orderNotificationQueue.process(processOrderNotification);
  
  logger.info('Order notification queue processor registered');
  
  return {
    orderNotificationQueue
  };
};

// Fonction pour ajouter une notification à la file d'attente
const queueOrderNotification = async (notificationData) => {
  try {
    const job = await orderNotificationQueue.add(notificationData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
    
    logger.info(`Order notification queued for order ${notificationData.orderId}, job id: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to queue notification for order ${notificationData.orderId}:`, error);
    throw error;
  }
};

module.exports = {
  setupQueues,
  queueOrderNotification
}; 