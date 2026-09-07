import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      where: { verificationStatus: 'APPROVED' },
      include: { user: { select: { email: true, name: true } } },
    });

    const publishers = await prisma.publisher.findMany({
      where: { verificationStatus: 'APPROVED' },
      include: { user: { select: { email: true, name: true } } },
    });

    return NextResponse.json({ authors, publishers });
  } catch (error) {
    console.error('Directory error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}