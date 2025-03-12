import { API_URLS } from './config';
import axios from 'axios';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
  }
}

// Création d'une instance Axios pour l'authentification
const authApi = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Service d'authentification
export const authService = {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Making login request to:', API_URLS.AUTH.LOGIN);
      const response = await authApi.post(API_URLS.AUTH.LOGIN, credentials);
      const data = response.data;
      
      if (data.data?.token && data.data?.user) {
        this.saveAuth(data.data.token, data.data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Auth API Error:', error);
      throw error;
    }
  },

  // Inscription
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await authApi.post(API_URLS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Vérification du token
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await authApi.get(API_URLS.AUTH.VERIFY, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  // Déconnexion
  async logout(token: string): Promise<boolean> {
    try {
      const response = await authApi.post(API_URLS.AUTH.LOGOUT, null, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      this.clearAuth();
      return response.status === 200;
    } catch (error) {
      console.error('Logout error:', error);
      this.clearAuth();
      return false;
    }
  },

  // Récupérer le token du localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  // Enregistrer le token et les infos utilisateur
  saveAuth(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Supprimer les données d'authentification
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // Récupérer l'utilisateur du localStorage
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.getToken();
  },
}; 