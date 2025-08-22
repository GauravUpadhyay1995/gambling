import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  const isAdminLoginPage = pathname == '/login';
  const isAdminRoute = pathname.startsWith('/admin');

  // If already logged in and trying to access login page, redirect to admin dashboard
  if (isAdminLoginPage && adminToken) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Protect admin routes if not logged in
  if (isAdminRoute && !isAdminLoginPage && !adminToken) {
    const adminLoginUrl = new URL('/login', request.url);
    adminLoginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(adminLoginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all /admin routes and /login
    '/admin/:path*',
    '/login',
    // Exclude API, static, images, favicon
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
