import { authService } from './authService';

// Options pour les requêtes
interface RequestOptions {
  method: string;
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

// Client HTTP
export const httpClient = {
  // Méthode request générique
  async request<T>(url: string, options: RequestOptions): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      // Ajouter le token d'authentification si nécessaire
      if (options.requireAuth) {
        const token = authService.getToken();
        if (!token) {
          throw new Error('Authentification requise');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Préparer les options de la requête
      const fetchOptions: RequestInit = {
        method: options.method,
        headers,
      };

      // Ajouter le body si nécessaire
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      // Effectuer la requête
      const response = await fetch(url, fetchOptions);

      // Gérer les erreurs HTTP
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }

      // Vérifier si la réponse est JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return response.text() as unknown as T;
    } catch (error) {
      console.error('HTTP request error:', error);
      throw error;
    }
  },

  // Méthodes helpers pour les différents types de requêtes
  get<T>(url: string, requireAuth = false): Promise<T> {
    return this.request<T>(url, {
      method: 'GET',
      requireAuth,
    });
  },

  post<T>(url: string, data: any, requireAuth = false): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data,
      requireAuth,
    });
  },

  put<T>(url: string, data: any, requireAuth = true): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data,
      requireAuth,
    });
  },

  delete<T>(url: string, requireAuth = true): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE',
      requireAuth,
    });
  },
}; 