import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ exists: false, verified: false });
    }

    return NextResponse.json({
      exists: true,
      verified: !!user.emailVerified,
    });
  } catch (error) {
    console.error('Check email status error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}