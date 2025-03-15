import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './config';

// Création d'une instance Axios avec configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur de requêtes pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponses pour gérer les erreurs
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Si l'erreur est 401 (non autorisé) et que ce n'est pas une demande de rafraîchissement de token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh-token') {
      originalRequest._retry = true;
      
      try {
        // Tenter de rafraîchir le token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          token: refreshToken,
        });
        
        const { token } = response.data.data;
        
        // Sauvegarder le nouveau token
        localStorage.setItem('authToken', token);
        
        // Mettre à jour le header et réessayer la requête
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement du token, déconnecter l'utilisateur
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion
        window.location.href = '/auth/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 