'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
        const response = await fetch('http://localhost:3333/user/me', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        const authenticated = response.ok;
        setIsAuthenticated(authenticated);
        
        console.log('ClientLayout auth check:', { 
          pathname, 
          authenticated, 
          isPublicPage,
          responseStatus: response.status 
        });

      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, isPublicPage]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">You need to sign in to view this page</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
