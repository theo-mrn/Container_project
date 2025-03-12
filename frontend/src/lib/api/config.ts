// Fonction utilitaire pour déterminer l'URL de base à utiliser
const getBaseUrl = (type: 'auth' | 'orders' = 'auth') => {
  if (typeof window === 'undefined') {
    // Côté serveur, utiliser les URLs internes
    return type === 'auth'
      ? process.env.INTERNAL_AUTH_API_URL || 'http://users_service:5001'
      : process.env.INTERNAL_ORDERS_API_URL || 'http://orders_service:5002';
  }
  // Côté client (navigateur), utiliser les URLs publiques
  return type === 'auth'
    ? process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5001'
    : process.env.NEXT_PUBLIC_ORDERS_API_URL || 'http://localhost:5002';
};

// Configuration des URLs d'API pour l'authentification et les utilisateurs
const AUTH_API_BASE = getBaseUrl('auth');
// Configuration des URLs d'API pour les commandes et restaurants
const ORDERS_API_BASE = getBaseUrl('orders');

// Log des URLs pour le debugging
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === 'true') {
  console.log('API Configuration:', {
    AUTH_API_BASE,
    ORDERS_API_BASE,
    AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
    ORDERS_API_URL: process.env.NEXT_PUBLIC_ORDERS_API_URL,
    INTERNAL_AUTH_API_URL: process.env.INTERNAL_AUTH_API_URL,
    INTERNAL_ORDERS_API_URL: process.env.INTERNAL_ORDERS_API_URL,
    isClient: typeof window !== 'undefined'
  });
}

// Vérification des URLs requises
if (!AUTH_API_BASE || !ORDERS_API_BASE) {
  console.error('AUTH_API_BASE_URL or ORDERS_API_BASE_URL is not defined');
}

export const API_URLS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${AUTH_API_BASE}/api/auth/login`,
    REGISTER: `${AUTH_API_BASE}/api/auth/register`,
    VERIFY: `${AUTH_API_BASE}/api/auth/verify`,
    REFRESH_TOKEN: `${AUTH_API_BASE}/api/auth/refresh-token`,
    LOGOUT: `${AUTH_API_BASE}/api/auth/logout`,
  },
  
  // Users endpoints
  USERS: {
    BASE: `${AUTH_API_BASE}/api/users`,
    PROFILE: `${AUTH_API_BASE}/api/users/profile`,
  },
  
  // Orders endpoints
  ORDERS: {
    BASE: `${ORDERS_API_BASE}/api/orders`,
    USER_ORDERS: `${ORDERS_API_BASE}/api/orders/user`,
  },

  // Restaurant endpoints
  RESTAURANTS: {
    BASE: `${ORDERS_API_BASE}/api/restaurants`,
    MENU: (id: string) => `${ORDERS_API_BASE}/api/restaurants/${id}/menu`,
  },
}; 