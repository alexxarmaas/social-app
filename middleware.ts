import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/get-app',
  '/about',
  '/who-are-we',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow Next.js internals and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Allow explicit public pages
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Allow GET requests to view pages without auth (public view).
  // For non-GET requests (actions that modify data), require a valid session.
  if (req.method === 'GET') {
    return NextResponse.next();
  }

  // For unsafe methods, check next-auth token (session). If missing, redirect to login preserving requested path
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // run middleware for all paths (we whitelist inside the middleware)
  matcher: '/:path*',
};
