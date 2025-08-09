import { NextRequest, NextResponse } from 'next/server';

interface DebugInfo {
  pathname: string;
  isAuthenticated: boolean;
  timestamp: string;
  routeExists?: boolean;
  isProtectedRoute?: boolean;
  action?: string;
}

const protectedRoutes = ['/dashboard', '/clients', '/invoices'];
const publicRoutes = ['/', '/login', '/register'];
const allowedRoutes = [...protectedRoutes, ...publicRoutes];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;

  const debugInfo: DebugInfo = {
    pathname,
    isAuthenticated,
    timestamp: new Date().toISOString()
  };

  const routeExists = allowedRoutes.some(route => {
    if (route === pathname) return true;
    if (route === '/clients' && pathname.startsWith('/clients/')) return true;
    if (route === '/invoices' && pathname.startsWith('/invoices/')) return true;
    return false;
  });

  debugInfo.routeExists = routeExists;

  if (!routeExists) {
    debugInfo.action = 'redirect-to-home';
    const response = NextResponse.redirect(new URL('/', request.url));
    response.headers.set('x-middleware-debug', JSON.stringify(debugInfo));
    return response;
  }

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  debugInfo.isProtectedRoute = isProtectedRoute;

  if (isAuthenticated && publicRoutes.includes(pathname)) {
    debugInfo.action = 'authorized-redirect-to-dashboard';
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.headers.set('x-middleware-debug', JSON.stringify(debugInfo));
    return response;
  }
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    debugInfo.action = 'authorized-redirect-to-dashboard';
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.headers.set('x-middleware-debug', JSON.stringify(debugInfo));
    return response;
  }

  debugInfo.action = 'proceed';
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  response.headers.set('x-authenticated', isAuthenticated.toString());
  response.headers.set('x-middleware-debug', JSON.stringify(debugInfo));
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
