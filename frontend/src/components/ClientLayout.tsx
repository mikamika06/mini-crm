'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

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

  const publicPaths = ['/login', '/register'];
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

  // This part is tricky because of the redirect logic in AuthContext.
  // We might show this briefly before the redirect happens.
  // Or if something goes wrong and the redirect doesn't fire.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
