const express = require('express');
const router = express.Router();
const { dbClient } = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');
const { logger } = require('../config/logger');

// Créer une nouvelle réservation
router.post('/', authenticate, async (req, res) => {
  try {
    const { restaurantId, date, time, numberOfGuests, specialRequests } = req.body;
    const userId = req.user.id;

    // Vérifier si le restaurant existe
    const restaurantResult = await dbClient.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({ message: 'Restaurant non trouvé' });
    }

    // Vérifier si la table est disponible
    const existingBookingResult = await dbClient.query(
      `SELECT * FROM bookings 
       WHERE restaurant_id = $1 
       AND date = $2 
       AND time = $3 
       AND status != 'cancelled'`,
      [restaurantId, date, time]
    );

    if (existingBookingResult.rows.length > 0) {
      return res.status(400).json({ message: 'Cette table est déjà réservée pour cette date et heure' });
    }

    // Créer la réservation
    const result = await dbClient.query(
      `INSERT INTO bookings 
       (user_id, restaurant_id, date, time, number_of_guests, special_requests, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, restaurantId, date, time, numberOfGuests, specialRequests]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating booking:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la réservation' });
  }
});

// Obtenir les réservations d'un utilisateur
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await dbClient.query(
      `SELECT b.*, r.name as restaurant_name, r.location as restaurant_location
       FROM bookings b
       JOIN restaurants r ON b.restaurant_id = r.id
       WHERE b.user_id = $1
       ORDER BY b.date DESC, b.time DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
  }
});

// Annuler une réservation
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // Vérifier si la réservation appartient à l'utilisateur
    const bookingResult = await dbClient.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Mettre à jour le statut de la réservation
    const result = await dbClient.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', bookingId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de la réservation' });
  }
});

module.exports = router; 