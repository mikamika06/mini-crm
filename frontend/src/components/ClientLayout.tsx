'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  
  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = pathname ? publicPages.includes(pathname) : false;

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
          : null;

        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const response = await fetchWithAuth('/user/me');
        const authenticated = response.ok;
        setIsAuthenticated(authenticated);
        
        console.log('ClientLayout auth check:', { 
          pathname, 
          authenticated, 
          isPublicPage,
          responseStatus: response.status,
          hasToken: !!token
        });

      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && isAuthenticated !== null) {
      if (!isAuthenticated && !isPublicPage) {
        router.push('/login');
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isPublicPage, pathname, router]); 

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

  if (isPublicPage) {
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

  if (!isAuthenticated && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
