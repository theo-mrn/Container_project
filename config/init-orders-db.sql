-- Création de la table des restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des images des restaurants
CREATE TABLE IF NOT EXISTS restaurant_images (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des caractéristiques des restaurants
CREATE TABLE IF NOT EXISTS restaurant_features (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, feature_name)
);

-- Création de la table des catégories de menu
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des plats
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des éléments de commande
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajout d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);

-- Insertion de données de test
INSERT INTO restaurants (name, description, cuisine, location) VALUES
('Le Bistrot Parisien', 'Un authentique bistrot français au cœur de la ville', 'Française', 'Paris'),
('Sushi Master', 'Les meilleurs sushi de la région', 'Japonaise', 'Lyon'),
('Pizza Express', 'Pizzas artisanales cuites au feu de bois', 'Italienne', 'Marseille');

-- Ajout de quelques caractéristiques
INSERT INTO restaurant_features (restaurant_id, feature_name) VALUES
(1, 'Terrasse'),
(1, 'Wifi gratuit'),
(2, 'Livraison'),
(2, 'À emporter'),
(3, 'Parking gratuit');

-- Ajout de quelques images
INSERT INTO restaurant_images (restaurant_id, image_url, image_type, display_order) VALUES
(1, 'https://example.com/bistrot1.jpg', 'main', 1),
(1, 'https://example.com/bistrot2.jpg', 'interior', 2),
(2, 'https://example.com/sushi1.jpg', 'main', 1),
(3, 'https://example.com/pizza1.jpg', 'main', 1);

-- Ajout de catégories de menu
INSERT INTO menu_categories (restaurant_id, name, display_order) VALUES
(1, 'Entrées', 1),
(1, 'Plats', 2),
(1, 'Desserts', 3),
(2, 'Sushi', 1),
(2, 'Maki', 2),
(3, 'Pizzas', 1),
(3, 'Pâtes', 2);

-- Ajout de plats
INSERT INTO menu_items (category_id, name, description, price, display_order) VALUES
(1, 'Soupe à l''oignon', 'Soupe à l''oignon gratinée traditionnelle', 8.50, 1),
(1, 'Salade niçoise', 'Salade composée avec thon et olives', 9.50, 2),
(2, 'Steak frites', 'Steak de bœuf avec frites maison', 18.50, 1),
(2, 'Coq au vin', 'Coq mijoté au vin rouge', 16.50, 2),
(3, 'Crème brûlée', 'Crème brûlée à la vanille', 7.50, 1),
(4, 'Sushi saumon', 'Sushi au saumon frais', 3.50, 1),
(4, 'Sushi thon', 'Sushi au thon rouge', 4.00, 2),
(5, 'Maki concombre', 'Maki au concombre', 4.50, 1),
(6, 'Margherita', 'Tomate, mozzarella, basilic', 12.00, 1),
(6, 'Regina', 'Tomate, mozzarella, jambon, champignons', 14.00, 2),
(7, 'Carbonara', 'Pâtes à la carbonara', 13.50, 1); 