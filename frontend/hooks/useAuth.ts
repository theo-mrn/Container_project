import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...');
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Auth check response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth data:', data);
        if (data && data.user) {
          setUser(data.user);
          console.log('User authenticated:', data.user);
        } else {
          console.log('No user data in response');
          setUser(null);
        }
      } else {
        console.log('Auth check failed:', await response.text());
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting to logout...');
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Logout response:', response.status);

      if (response.ok) {
        setUser(null);
        router.push('/');
        console.log('Logout successful');
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  };
}; 