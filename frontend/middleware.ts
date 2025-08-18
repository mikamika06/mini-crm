import { NextRequest, NextResponse } from 'next/server';

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

  const token = request.cookies.get('authToken')?.value;
  const isAuthenticated = !!token;

  console.log('Middleware check:', {
    pathname,
    hasToken: isAuthenticated,
    cookieValue: token ? 'exists' : 'missing'
  });

  const isPublicRoute = pathname === '/' || 
                       pathname === '/login' || 
                       pathname === '/register' ||
                       pathname === '/access-denied';

  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/clients') ||
                          pathname.startsWith('/invoices');

  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
