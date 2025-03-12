const { dbClient } = require('../config/db');
const { logger } = require('../config/logger');

class RestaurantModel {
  /**
   * Récupérer tous les restaurants avec leurs images et caractéristiques
   */
  async findAll() {
    try {
      const query = `
        SELECT 
          r.*,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'image_url', ri.image_url,
                'image_type', ri.image_type
              )
            ) FILTER (WHERE ri.image_url IS NOT NULL),
            '[]'::json
          ) as images,
          COALESCE(
            json_agg(DISTINCT rf.feature_name) FILTER (WHERE rf.feature_name IS NOT NULL),
            '[]'::json
          ) as features
        FROM restaurants r
        LEFT JOIN restaurant_images ri ON r.id = ri.restaurant_id
        LEFT JOIN restaurant_features rf ON r.id = rf.restaurant_id
        GROUP BY r.id
        ORDER BY r.name
      `;
      const result = await dbClient.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  /**
   * Récupérer un restaurant par son ID avec ses images et caractéristiques
   */
  async findById(id) {
    try {
      const query = `
        SELECT 
          r.*,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'image_url', ri.image_url,
                'image_type', ri.image_type
              )
            ) FILTER (WHERE ri.image_url IS NOT NULL),
            '[]'::json
          ) as images,
          COALESCE(
            json_agg(DISTINCT rf.feature_name) FILTER (WHERE rf.feature_name IS NOT NULL),
            '[]'::json
          ) as features
        FROM restaurants r
        LEFT JOIN restaurant_images ri ON r.id = ri.restaurant_id
        LEFT JOIN restaurant_features rf ON r.id = rf.restaurant_id
        WHERE r.id = $1
        GROUP BY r.id
      `;
      const result = await dbClient.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error finding restaurant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les catégories de menu d'un restaurant
   */
  async findCategories(restaurantId) {
    try {
      const query = `
        SELECT * FROM menu_categories
        WHERE restaurant_id = $1
        ORDER BY display_order, name
      `;
      const result = await dbClient.query(query, [restaurantId]);
      return result.rows;
    } catch (error) {
      logger.error(`Error fetching categories for restaurant ${restaurantId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les plats d'une catégorie
   */
  async findMenuItems(categoryId) {
    try {
      const query = `
        SELECT * FROM menu_items
        WHERE category_id = $1 AND is_available = true
        ORDER BY display_order, name
      `;
      const result = await dbClient.query(query, [categoryId]);
      return result.rows;
    } catch (error) {
      logger.error(`Error fetching menu items for category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer un plat par son ID
   */
  async findMenuItem(itemId) {
    try {
      const query = 'SELECT * FROM menu_items WHERE id = $1';
      const result = await dbClient.query(query, [itemId]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error finding menu item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer le menu complet d'un restaurant
   */
  async getFullMenu(restaurantId) {
    try {
      // D'abord, récupérer les informations du restaurant
      const restaurantQuery = `
        SELECT 
          r.*,
          json_agg(
            DISTINCT jsonb_build_object(
              'image_url', ri.image_url,
              'image_type', ri.image_type
            )
          ) FILTER (WHERE ri.image_url IS NOT NULL) as images,
          json_agg(DISTINCT rf.feature_name) FILTER (WHERE rf.feature_name IS NOT NULL) as features
        FROM restaurants r
        LEFT JOIN restaurant_images ri ON r.id = ri.restaurant_id
        LEFT JOIN restaurant_features rf ON r.id = rf.restaurant_id
        WHERE r.id = $1
        GROUP BY r.id
      `;
      
      const restaurantResult = await dbClient.query(restaurantQuery, [restaurantId]);
      const restaurant = restaurantResult.rows[0];
      
      if (!restaurant) {
        return null;
      }

      // Ensuite, récupérer les catégories et leurs items
      const menuQuery = `
        SELECT 
          mc.id,
          mc.name,
          mc.display_order,
          json_agg(
            jsonb_build_object(
              'id', mi.id,
              'name', mi.name,
              'description', mi.description,
              'price', mi.price,
              'is_available', mi.is_available
            ) ORDER BY mi.display_order
          ) FILTER (WHERE mi.id IS NOT NULL) as items
        FROM menu_categories mc
        LEFT JOIN menu_items mi ON mc.id = mi.category_id AND mi.is_available = true
        WHERE mc.restaurant_id = $1
        GROUP BY mc.id, mc.name, mc.display_order
        ORDER BY mc.display_order
      `;
      
      const menuResult = await dbClient.query(menuQuery, [restaurantId]);
      
      // Combiner les résultats
      return {
        ...restaurant,
        categories: menuResult.rows
      };
    } catch (error) {
      logger.error(`Error fetching full menu for restaurant ${restaurantId}:`, error);
      throw error;
    }
  }

  /**
   * Créer un nouveau restaurant avec ses images et caractéristiques
   */
  async create(data) {
    const client = await dbClient.connect();
    try {
      const {
        name,
        description,
        cuisine,
        location,
        features = [],
        images = []
      } = data;

      // Commencer une transaction
      await client.query('BEGIN');

      // Créer le restaurant
      const restaurantQuery = `
        INSERT INTO restaurants (name, description, cuisine, location, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;
      
      const restaurantResult = await client.query(restaurantQuery, [
        name,
        description,
        cuisine,
        location
      ]);

      const restaurant = restaurantResult.rows[0];

      // Ajouter les caractéristiques
      if (features.length > 0) {
        const featuresQuery = `
          INSERT INTO restaurant_features (restaurant_id, feature_name)
          SELECT $1, unnest($2::text[])
        `;
        await client.query(featuresQuery, [restaurant.id, features]);
      }

      // Ajouter les images
      if (images.length > 0) {
        const imagesQuery = `
          INSERT INTO restaurant_images (restaurant_id, image_url, image_type, display_order)
          VALUES ($1, $2, $3, $4)
        `;
        
        for (const image of images) {
          await client.query(imagesQuery, [
            restaurant.id,
            image.image_url,
            image.image_type,
            image.display_order
          ]);
        }
      }

      // Valider la transaction
      await client.query('COMMIT');

      // Récupérer le restaurant complet avec ses relations
      return this.findById(restaurant.id);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating restaurant:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Mettre à jour un restaurant
   */
  async update(id, updateData) {
    const client = await dbClient.connect();
    try {
      const {
        name,
        description,
        cuisine,
        location,
        features = [],
        images = []
      } = updateData;

      // Commencer une transaction
      await client.query('BEGIN');

      try {
        // Mettre à jour les informations de base du restaurant
        const restaurantQuery = `
          UPDATE restaurants 
          SET 
            name = $1,
            description = $2,
            cuisine = $3,
            location = $4,
            updated_at = NOW()
          WHERE id = $5
          RETURNING *
        `;
        
        const restaurantResult = await client.query(restaurantQuery, [
          name,
          description,
          cuisine,
          location,
          id
        ]);

        // Supprimer les anciennes caractéristiques
        await client.query('DELETE FROM restaurant_features WHERE restaurant_id = $1', [id]);
        
        // Insérer les nouvelles caractéristiques
        if (features.length > 0) {
          const featuresQuery = `
            INSERT INTO restaurant_features (restaurant_id, feature_name)
            SELECT $1, unnest($2::text[])
          `;
          await client.query(featuresQuery, [id, features]);
        }

        // Gérer les images
        if (images && images.length > 0) {
          // Supprimer les anciennes images
          await client.query('DELETE FROM restaurant_images WHERE restaurant_id = $1', [id]);
          
          // Insérer les nouvelles images
          const imagesQuery = `
            INSERT INTO restaurant_images (restaurant_id, image_url, image_type, display_order)
            VALUES ($1, $2, $3, $4)
          `;
          
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            await client.query(imagesQuery, [
              id,
              image.image_url,
              image.image_type,
              image.display_order || i + 1
            ]);
          }
        }

        // Valider la transaction
        await client.query('COMMIT');

        // Retourner le restaurant mis à jour avec ses relations
        const updatedRestaurant = await this.findById(id);
        return updatedRestaurant;

      } catch (error) {
        // En cas d'erreur, annuler la transaction
        await client.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      logger.error(`Error updating restaurant ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Créer une nouvelle catégorie de menu avec ses plats
   */
  async createCategory(restaurantId, data) {
    const client = await dbClient.connect();
    try {
      await client.query('BEGIN');

      // Créer la catégorie
      const categoryQuery = `
        INSERT INTO menu_categories (restaurant_id, name, display_order)
        VALUES ($1, $2, (
          SELECT COALESCE(MAX(display_order), 0) + 1
          FROM menu_categories
          WHERE restaurant_id = $1
        ))
        RETURNING *
      `;
      
      const categoryResult = await client.query(categoryQuery, [restaurantId, data.name]);
      const category = categoryResult.rows[0];

      // Ajouter les plats
      if (data.items && data.items.length > 0) {
        const itemsQuery = `
          INSERT INTO menu_items (category_id, name, description, price, display_order)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        
        const items = [];
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          const itemResult = await client.query(itemsQuery, [
            category.id,
            item.name,
            item.description,
            item.price,
            i + 1
          ]);
          items.push(itemResult.rows[0]);
        }
        category.items = items;
      }

      await client.query('COMMIT');
      return category;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error creating category for restaurant ${restaurantId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new RestaurantModel(); 