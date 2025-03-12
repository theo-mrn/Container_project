import axios, { AxiosInstance } from "axios"

// URLs from environment variables
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:80"
const RESTAURANT_API_URL = process.env.NEXT_PUBLIC_RESTAURANT_API_URL || "http://localhost:80"
const ORDERS_API_URL = process.env.NEXT_PUBLIC_ORDERS_API_URL || "http://localhost:80"

// Configuration de base commune
const baseConfig = {
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true, // Important pour CORS avec credentials
}

// Instance pour l'authentification
export const authApi: AxiosInstance = axios.create({
  ...baseConfig,
  baseURL: AUTH_API_URL,
})

// Instance pour les restaurants
export const restaurantApi: AxiosInstance = axios.create({
  ...baseConfig,
  baseURL: RESTAURANT_API_URL,
})

// Instance pour les commandes
export const ordersApi: AxiosInstance = axios.create({
  ...baseConfig,
  baseURL: ORDERS_API_URL,
})

// Fonction pour ajouter les intercepteurs d'authentification
const addAuthInterceptors = (api: AxiosInstance) => {
  // Intercepteur pour ajouter le token d'authentification
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Intercepteur pour gérer les erreurs d'authentification
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken")
      }
      return Promise.reject(error)
    }
  )
}

// Ajouter les intercepteurs à toutes les instances
[restaurantApi, ordersApi].forEach(addAuthInterceptors)

export default {
  authApi,
  restaurantApi,
  ordersApi,
} 