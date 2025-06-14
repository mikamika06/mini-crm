import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/clients', '/invoices'];

export function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = cookieHeader
    ?.split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  console.log('[middleware] cookie header:', cookieHeader);
  const isProtected = protectedRoutes.some(path =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/clients/:path*', '/invoices/:path*'],
};
