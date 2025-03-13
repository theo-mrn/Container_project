const { dbClient } = require('../config/db');
const bcrypt = require('bcryptjs');
const { logger } = require('../config/logger');

class UserModel {
  /**
   * Créer un nouvel utilisateur
   */
  async create(userData) {
    try {
      // Hachage du mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Insertion en base de données
      const query = `
        INSERT INTO users (email, password, first_name, last_name, phone, address, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, first_name, last_name, phone, address, role, created_at
      `;
      
      const values = [
        userData.email,
        hashedPassword,
        userData.first_name,
        userData.last_name,
        userData.phone || null,
        userData.address || null,
        userData.role || 'customer'
      ];
      
      const result = await dbClient.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Trouver un utilisateur par son ID
   */
  async findById(id) {
    try {
      const query = `
        SELECT id, email, first_name, last_name, phone, address, role, created_at, updated_at 
        FROM users 
        WHERE id = $1
      `;
      const result = await dbClient.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error finding user by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Trouver un utilisateur par son email
   */
  async findByEmail(email) {
    try {
      const query = `
        SELECT * FROM users WHERE email = $1
      `;
      const result = await dbClient.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async update(id, userData) {
    try {
      // Construire la requête dynamiquement
      let query = 'UPDATE users SET ';
      const updates = [];
      const values = [];
      let paramIndex = 1;

      // Ajouter chaque champ à mettre à jour
      for (const [key, value] of Object.entries(userData)) {
        // Ne pas mettre à jour le mot de passe ici
        if (key !== 'password' && value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      // Si aucun champ à mettre à jour
      if (updates.length === 0) {
        return await this.findById(id);
      }

      // Finaliser la requête
      query += updates.join(', ') + ` WHERE id = $${paramIndex} RETURNING id, email, first_name, last_name, phone, address, role, created_at, updated_at`;
      values.push(id);

      const result = await dbClient.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Changer le mot de passe d'un utilisateur
   */
  async changePassword(id, newPassword) {
    try {
      // Hachage du nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const query = `
        UPDATE users 
        SET password = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `;
      
      const result = await dbClient.query(query, [hashedPassword, id]);
      return result.rows[0] ? true : false;
    } catch (error) {
      logger.error(`Error changing password for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await dbClient.query(query, [id]);
      return result.rows[0] ? true : false;
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier les identifiants de connexion
   */
  async authenticate(email, password) {
    try {
      // Récupérer l'utilisateur avec son mot de passe hashé
      const user = await this.findByEmail(email);
      
      if (!user) {
        return null;
      }
      
      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return null;
      }
      
      // Ne pas renvoyer le mot de passe
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error(`Error authenticating user ${email}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer tous les utilisateurs
   */
  async findAll() {
    try {
      const query = `
        SELECT id, email, first_name, last_name, phone, address, role, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
      const result = await dbClient.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw error;
    }
  }
}

module.exports = new UserModel(); 