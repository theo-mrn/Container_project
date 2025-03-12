// Configuration des URLs des microservices
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

export const API_ENDPOINTS = {
  // Service utilisateurs
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    verifyToken: `${API_BASE_URL}/api/auth/verify`,
    refreshToken: `${API_BASE_URL}/api/auth/refresh-token`,
    logout: `${API_BASE_URL}/api/auth/logout`,
  },
  users: {
    profile: `${API_BASE_URL}/api/users/profile`,
    changePassword: `${API_BASE_URL}/api/users/change-password`,
  },
  
  // Service commandes
  restaurants: {
    getAll: `${API_BASE_URL}/api/restaurants`,
    getById: (id: string) => `${API_BASE_URL}/api/restaurants/${id}`,
    getMenu: (id: string) => `${API_BASE_URL}/api/restaurants/${id}/menu`,
    getCategories: (id: string) => `${API_BASE_URL}/api/restaurants/${id}/categories`,
    getCategoryItems: (categoryId: string) => `${API_BASE_URL}/api/restaurants/categories/${categoryId}/items`,
    getMenuItem: (itemId: string) => `${API_BASE_URL}/api/restaurants/menu-items/${itemId}`,
  },
  orders: {
    create: `${API_BASE_URL}/api/orders`,
    getMyOrders: `${API_BASE_URL}/api/orders/my-orders`,
    getById: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
    getNotifications: (id: string) => `${API_BASE_URL}/api/orders/${id}/notifications`,
    updateStatus: (id: string) => `${API_BASE_URL}/api/orders/${id}/status`,
    getRestaurantOrders: (restaurantId: string) => `${API_BASE_URL}/api/orders/restaurant/${restaurantId}`,
  },
}; 