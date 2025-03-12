const { logger } = require('../config/logger');
const { dbClient } = require('../config/db');

/**
 * Processeur de notifications pour les commandes
 * Cette fonction est appelée lorsqu'une tâche est extraite de la file d'attente
 */
const processOrderNotification = async (job) => {
  const { orderId, type, message, userId } = job.data;
  
  logger.info(`Processing notification for order ${orderId}, type: ${type}`);
  
  try {
    // Enregistrement de la notification dans la base de données
    const query = `
      INSERT INTO notifications (order_id, type, message)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    const result = await dbClient.query(query, [orderId, type, message]);
    const notificationId = result.rows[0].id;
    
    logger.info(`Notification ${notificationId} saved for order ${orderId}`);
    
    // En production, on pourrait envoyer un email, SMS, ou notification push ici
    // Exemples:
    // - Envoi d'email via SendGrid ou AWS SES
    // - Envoi de SMS via Twilio
    // - Envoi de notification push via Firebase Cloud Messaging
    // - Mise à jour en temps réel via WebSockets
    
    // Simulation d'un traitement asynchrone
    await simulateNotificationDelivery(type);
    
    logger.info(`Notification ${notificationId} for order ${orderId} processed successfully`);
    
    return { success: true, notificationId };
  } catch (error) {
    logger.error(`Error processing notification for order ${orderId}:`, error);
    throw error; // Cela déclenchera une nouvelle tentative selon la configuration de la file d'attente
  }
};

/**
 * Fonction qui simule l'envoi d'une notification
 * Dans un environnement de production, cette fonction serait remplacée
 * par l'intégration avec un service réel d'envoi de notifications
 */
const simulateNotificationDelivery = async (type) => {
  // Simuler des délais différents selon le type de notification
  const delay = type === 'order_confirmed' ? 500 :
               type === 'order_preparing' ? 700 :
               type === 'order_ready' ? 1000 : 300;
  
  return new Promise(resolve => setTimeout(resolve, delay));
};

module.exports = { processOrderNotification }; 