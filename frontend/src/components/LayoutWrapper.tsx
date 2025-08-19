'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const publicPaths = ['/', '/login', '/register'];
  const isPublicRoute = publicPaths.includes(pathname || '');

  if (isPublicRoute) {
    return <>{children}</>;
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

  
  return <>{children}</>;
}