-- Table principale des restaurants
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1),
    phone VARCHAR(20)
);

-- Table des images des restaurants
CREATE TABLE restaurant_images (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('main', 'interior', 'food', 'other')),
    display_order INTEGER NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Table des caractéristiques des restaurants
CREATE TABLE restaurant_features (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Table des catégories de menu
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);




-- Table des plats
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    display_order INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT true,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);