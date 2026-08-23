import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';

export async function GET(req: Request) {
  const results: any = {
    secretExists: false,
    secretLength: 0,
    nextAuthUrl: undefined,
    envDatabaseUrl: 'missing',
    envDatabaseUrlPrefix: 'none',
    cookies: 'none',
    token: null,
    tokenError: undefined,
    userFromHelper: null,
    userHelperError: undefined,
    dbConnected: false,
    dbError: undefined,
    userCount: undefined,
  };

  // 1. Check NEXTAUTH_SECRET
  results.secretExists = !!process.env.NEXTAUTH_SECRET;
  results.secretLength = process.env.NEXTAUTH_SECRET?.length || 0;

  // 2. Check NEXTAUTH_URL
  results.nextAuthUrl = process.env.NEXTAUTH_URL;

  // 3. Check DATABASE_URL
  results.envDatabaseUrl = process.env.DATABASE_URL ? 'exists' : 'missing';
  results.envDatabaseUrlPrefix = process.env.DATABASE_URL?.substring(0, 30) || 'none';

  // 4. Check cookies
  const cookieHeader = req.headers.get('cookie');
  results.cookies = cookieHeader ? cookieHeader.split(';').map(c => c.trim()) : 'none';

  // 5. Decode token
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    results.token = token;
  } catch (error: any) {
    results.tokenError = error.message;
  }

  // 6. Get user from token
  try {
    const user = await getUserFromRequest(req);
    results.userFromHelper = user ? { id: user.id, email: user.email, role: user.role } : null;
  } catch (error: any) {
    results.userHelperError = error.message;
  }

  // 7. Check DB connection
  try {
    const userCount = await prisma.user.count();
    results.dbConnected = true;
    results.userCount = userCount;
  } catch (error: any) {
    results.dbConnected = false;
    results.dbError = error.message;
  }

  return NextResponse.json(results);
}