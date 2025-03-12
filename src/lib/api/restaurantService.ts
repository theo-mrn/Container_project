import apiClient from './client';
import { API_ENDPOINTS } from './config';

// Types pour les restaurants et les menus
export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  open_time: string;
  close_time: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  items?: MenuItem[];
}

export interface FullMenu extends Restaurant {
  categories: MenuCategory[];
}

// Service pour les restaurants
const restaurantService = {
  /**
   * Récupère tous les restaurants
   */
  async getAllRestaurants(): Promise<Restaurant[]> {
    const response = await apiClient.get(API_ENDPOINTS.restaurants.getAll);
    return response.data.data.restaurants;
  },
  
  /**
   * Récupère un restaurant par son ID
   */
  async getRestaurantById(id: string): Promise<Restaurant> {
    const response = await apiClient.get(API_ENDPOINTS.restaurants.getById(id));
    return response.data.data.restaurant;
  },
  
  /**
   * Récupère le menu complet d'un restaurant (avec catégories et plats)
   */
  async getRestaurantMenu(id: string): Promise<FullMenu> {
    const response = await apiClient.get(API_ENDPOINTS.restaurants.getMenu(id));
    return response.data.data.menu;
  },
  
  /**
   * Récupère les catégories de menu d'un restaurant
   */
  async getMenuCategories(id: string): Promise<MenuCategory[]> {
    const response = await apiClient.get(API_ENDPOINTS.restaurants.getCategories(id));
    return response.data.data.categories;
  },
  
  /**
   * Récupère les plats d'une catégorie
   */
  async getCategoryItems(categoryId: string): Promise<MenuItem[]> {
    const response = await apiClient.get(API_ENDPOINTS.restaurants.getCategoryItems(categoryId));
    return response.data.data.items;
  },
  
  /**
   * Récupère un plat par son ID
   */
  async getMenuItem(itemId: string): Promise<MenuItem> {
    const response = await apiClient.get(API_ENDPOINTS.restaurants.getMenuItem(itemId));
    return response.data.data.item;
  }
};

export default restaurantService; 