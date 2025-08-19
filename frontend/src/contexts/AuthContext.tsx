'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface UserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: UserData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const tokenCookie = document.cookie
          .split(';')
          .find(c => c.trim().startsWith('token='))
          ?.split('=')[1];

        if (!tokenCookie) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/user/me`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${tokenCookie}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    const token = document.cookie.includes('token=');
    if (token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
    
    const userResponse = await fetch(`${API_URL}/user/me`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${data.access_token}`
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData);
      setIsAuthenticated(true);
      router.push('/dashboard');
    } else {
      throw new Error('Failed to get user data');
    }
  };

  const logout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  const register = async (userData: UserData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};