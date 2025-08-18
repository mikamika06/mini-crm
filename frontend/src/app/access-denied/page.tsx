'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';
import Link from 'next/link';

interface DebugInfo {
  cookies?: {
    hasToken: boolean;
    raw: string;
  };
  profile?: {
    status: number;
    data: Record<string, unknown>;
  };
  dashboard?: {
    status: number;
    data: Record<string, unknown>;
  };
  url?: string;
  userAgent?: string;
  timestamp?: string;
  error?: string;
}

export default function AccessDeniedPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setChecking(true);
      
      const cookies = document.cookie;
      const hasTokenCookie = cookies.includes('token=');
      
      const profileResponse = await fetchWithAuth('/auth/me');
      const profileData = await profileResponse.json();
      
      const dashboardResponse = await fetchWithAuth('/clients');
      const dashboardData = await dashboardResponse.json();
      
      setDebugInfo({
        cookies: {
          hasToken: hasTokenCookie,
          raw: cookies.substring(0, 200) + (cookies.length > 200 ? '...' : '')
        },
        profile: {
          status: profileResponse.status,
          data: profileData
        },
        dashboard: {
          status: dashboardResponse.status,
          data: dashboardData
        },
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setChecking(false);
    }
  };

  const clearCookiesAndLogin = () => {
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You need to sign in to view this page</p>
          </div>

          <div className="flex gap-4 justify-center mb-8">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Login
            </Link>
            <button
              onClick={clearCookiesAndLogin}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Session & Login
            </button>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Debug Information</h3>
              <button
                onClick={checkAuthStatus}
                disabled={checking}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                {checking ? 'Checking...' : 'Refresh'}
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}