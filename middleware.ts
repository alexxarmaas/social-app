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
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Allow explicit public pages
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Allow safe methods to view pages without auth (public view): GET, HEAD, OPTIONS.
  // For unsafe methods (POST, PUT, DELETE, PATCH, etc.), require a valid session.
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return NextResponse.next();
  }

  // For unsafe methods, check next-auth token (session). If missing, redirect to login preserving requested path
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // If the request looks like an XHR/fetch (expects JSON) or it's an API route,
    // return a 401 JSON response instead of redirecting to the login HTML page.
    const accept = req.headers.get('accept') || '';
    const isApi = pathname.startsWith('/api');
    const wantsJson = accept.includes('application/json') || req.headers.get('x-requested-with') === 'XMLHttpRequest';

    if (isApi || wantsJson) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
