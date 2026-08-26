import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PROTECTED_ROUTES = ['/projects', '/workspace', '/dashboard'];
const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sb-access-token')?.value || request.cookies.get('supabase-auth-token')?.value;

  const isProtectedRoute = AUTH_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};