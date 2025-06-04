import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Define paths that are considered authenticated
  const isAuthPath = path.startsWith('/auth');
  const isApiPath = path.startsWith('/api');
  const isPublicPath = isAuthPath || isApiPath || path === '/';

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect unauthenticated users to login page
  if (!token && !isPublicPath) {
    const url = new URL('/auth/signin', req.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // Check for admin routes
  if (path.startsWith('/admin') && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// Configure matcher for paths that trigger middleware
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};