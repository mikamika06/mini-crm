'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MiddlewareDebug() {
  const pathname = usePathname();

  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      const debugHeader = response.headers.get('x-middleware-debug');
      const pathHeader = response.headers.get('x-pathname');
      const authHeader = response.headers.get('x-authenticated');
      
      if (debugHeader) {
        try {
          const debugInfo = JSON.parse(debugHeader);
          console.log('🛡️ Middleware Debug:', debugInfo);
        } catch {
          console.log('🛡️ Middleware Debug (raw):', debugHeader);
        }
      } else if (pathHeader || authHeader) {
        console.log('🛡️ Middleware Headers:', {
          pathname: pathHeader,
          authenticated: authHeader === 'true'
        });
      }
      
      return response;
    };

    console.log('📍 Route changed:', pathname);

    return () => {
      window.fetch = originalFetch;
    };
  }, [pathname]);

  useEffect(() => {
    const checkMiddleware = async () => {
      try {
        const response = await fetch(window.location.href, { 
          method: 'HEAD',
          cache: 'no-store'
        });
        
        const debugHeader = response.headers.get('x-middleware-debug');
        if (debugHeader) {
          const debugInfo = JSON.parse(debugHeader);
          console.log('🔍 Current Page Middleware:', debugInfo);
        }
      } catch {
      }
    };

    checkMiddleware();
  }, [pathname]);

  return null;
}
