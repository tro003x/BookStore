import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If token is missing, let authorized callback handle it (redirect to login)
    if (!token) return NextResponse.next();

    // Role-based protection (only redirect if token has a role and it's wrong)
    if (path.startsWith('/dashboard/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (path.startsWith('/dashboard/publisher') && token.role !== 'PUBLISHER') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (path.startsWith('/dashboard/author') && token.role !== 'AUTHOR') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (path.startsWith('/dashboard/reader') && token.role !== 'READER') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Ensure user is logged in for any dashboard route
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/cart', '/purchases'],
};