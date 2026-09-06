import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log('Middleware - path:', path);
    console.log('Middleware - token:', token);
    console.log('Middleware - role:', token?.role);

    if (path.startsWith('/dashboard/admin')) {
      if (token?.role !== 'ADMIN') {
        console.log('Redirecting to / - not admin');
        return NextResponse.redirect(new URL('/', req.url));
      }
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
  matcher: ['/dashboard/:path*', '/cart', '/purchases'],
};