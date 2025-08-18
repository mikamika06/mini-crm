'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';

interface DebugInfo {
  hasTokenCookie?: boolean;
  cookies?: string;
  responseStatus?: number;
  responseData?: Record<string, unknown>;
  timestamp?: string;
  url?: string;
  error?: string;
}

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const cookies = document.cookie;
      const hasTokenCookie = cookies.includes('token=');
      
      const response = await fetchWithAuth('/auth/me');
      const responseData = await response.json();
      
      setDebugInfo({
        hasTokenCookie,
        cookies: cookies.substring(0, 100) + (cookies.length > 100 ? '...' : ''), // truncate long cookies
        responseStatus: response.status,
        responseData,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Auth Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <button
        onClick={checkAuth}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm mb-2"
      >
        Check Auth Status
      </button>
      
      {debugInfo && (
        <div className="text-xs bg-gray-900 p-2 rounded mt-2 overflow-auto max-h-32">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}