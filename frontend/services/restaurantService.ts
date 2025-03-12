import { restaurantApi } from "@/lib/axios"

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

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
}

export interface MenuCategory {
  id: number;
  name: string;
  display_order: number;
  items: MenuItem[];
}

export interface RestaurantWithMenu extends Restaurant {
  categories: MenuCategory[];
}

export interface CreateRestaurantData {
  name: string;
  description: string;
  cuisine: string;
  location: string;
  features: string[];
  images: {
    image_url: string;
    image_type: string;
    display_order: number;
  }[];
}

export interface CreateMenuCategoryData {
  name: string;
  items: {
    name: string;
    description: string;
    price: number;
  }[];
}

class RestaurantService {
  async getAllRestaurants() {
    const response = await restaurantApi.get<{ status: string; data: { restaurants: Restaurant[] } }>('/api/restaurants');
    return response.data;
  }

  async getRestaurantById(id: string): Promise<Restaurant> {
    const response = await restaurantApi.get<{ status: string; data: { restaurant: Restaurant } }>(`/api/restaurants/${id}`);
    return response.data.data.restaurant;
  }

  async getRestaurantMenu(id: string): Promise<RestaurantWithMenu> {
    const response = await restaurantApi.get<RestaurantWithMenu>(`/api/restaurants/${id}/menu`);
    return response.data;
  }

  async updateRestaurant(id: string, data: Partial<CreateRestaurantData>): Promise<Restaurant> {
    const response = await restaurantApi.put<{ status: string; data: { restaurant: Restaurant } }>(`/api/restaurants/${id}`, data);
    return response.data.data.restaurant;
  }

  async createRestaurant(data: CreateRestaurantData): Promise<Restaurant> {
    const response = await restaurantApi.post<{ status: string; data: { restaurant: Restaurant } }>('/api/restaurants', data);
    return response.data.data.restaurant;
  }

  async createMenuCategory(restaurantId: string, data: CreateMenuCategoryData): Promise<MenuCategory> {
    const response = await restaurantApi.post<{ status: string; data: { category: MenuCategory } }>(
      `/api/restaurants/${restaurantId}/categories`,
      data
    );
    return response.data.data.category;
  }
}

export const restaurantService = new RestaurantService(); 