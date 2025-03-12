export interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  location: string;
  rating?: number;
  phone?: string;
  images: {
    id?: number;
    image_url: string;
    image_type: 'main' | 'interior' | 'food' | 'other';
    display_order: number;
  }[];
  features: string[];
}

export interface MenuCategory {
  id: number;
  name: string;
  display_order: number;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
}

export interface RestaurantWithMenu extends Restaurant {
  categories: MenuCategory[];
} 