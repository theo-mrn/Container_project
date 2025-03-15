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

export interface ProfileResponse {
  status: string;
  data: {
    user: User;
  }
}

// Create Axios instance for authentication
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Authentication service
export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Making login request to:', `${authApi.defaults.baseURL}/api/auth/login`);
      const response = await authApi.post('/api/auth/login', credentials);
      const data = response.data;
      
      if (data.status === 'success' && data.data?.token && data.data?.user) {
        this.saveAuth(data.data.token, data.data.user);
        return data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/api/auth/register', userData);
      const data = response.data;
      
      if (data.status === 'success' && data.data?.token && data.data?.user) {
        this.saveAuth(data.data.token, data.data.user);
        return data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Logout
  async logout(token: string): Promise<boolean> {
    try {
      const response = await authApi.post('/api/auth/logout', null, {
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

  // Get token from localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  // Save token and user info
  saveAuth(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Clear auth data
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // Get user from localStorage
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  },

  // Get user profile
  async getProfile(): Promise<ProfileResponse> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Unauthorized');

      const response = await authApi.get('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch profile');
      }
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<ProfileResponse> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Unauthorized');

      const response = await authApi.put('/api/users/profile', userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(error.response?.data?.message || 'Failed to update profile');
      }
      throw error;
    }
  },
}; 