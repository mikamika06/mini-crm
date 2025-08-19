'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      if (token) {
        try {
          const response = await fetch('https://mini-crm-e6behmfva5efhsch.westeurope-01.azurewebsites.net/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            setIsAuthenticated(false);
          }
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined' && pathname) {
      const protectedRoutes = ['/dashboard', '/clients', '/invoices'];
      
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

      if (!isAuthenticated && isProtectedRoute) {
        router.push('/login');
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      } else if (isAuthenticated && pathname === '/') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, checkAuth, logout }}>
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