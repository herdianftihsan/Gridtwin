import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PROTECTED_ROUTES = ['/projects', '/workspace', '/dashboard', '/setup'];
const PUBLIC_AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sb-access-token')?.value;

  const isProtectedRoute = AUTH_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Removed redirect from '/' to '/dashboard' for authenticated users to allow access to the landing page

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};