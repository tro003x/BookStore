import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/dashboard/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (path.startsWith('/dashboard/publisher') && token?.role !== 'PUBLISHER') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (path.startsWith('/dashboard/reader') && token?.role !== 'READER') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cart',
    '/purchases',
    '/api/cart/:path*',
    '/api/purchases/:path*',
  ],
};