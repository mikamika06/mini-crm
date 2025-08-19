'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
          : null;

        console.log('Auth check starting:', { pathname, hasToken: !!token });

        if (!token) {
          console.log('No token found, setting unauthenticated');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const response = await fetchWithAuth('/user/me');
        const authenticated = response.ok;
        
        console.log('Auth API response:', { 
          authenticated, 
          status: response.status 
        });
        
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); 

  useEffect(() => {
    if (isLoading || hasRedirected) return;

    const publicPaths = ['/', '/login', '/register'];
    const isPublic = publicPaths.includes(pathname || '');

    console.log('Navigation check:', { 
      pathname, 
      isPublic, 
      isAuthenticated, 
      isLoading, 
      hasRedirected 
    });

    if (!isAuthenticated && !isPublic) {
      console.log('Redirecting to login...');
      setHasRedirected(true);
      router.push('/login');
    } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      console.log('Redirecting to dashboard...');
      setHasRedirected(true);
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router, hasRedirected]);

  useEffect(() => {
    setHasRedirected(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const publicPaths = ['/', '/login', '/register'];
  const isPublic = publicPaths.includes(pathname || '');

  if (isPublic) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 bg-white">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
