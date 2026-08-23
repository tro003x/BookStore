import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    const books = await prisma.book.findMany({
      where: { status: 'APPROVED' },
      include: { category: true, publisher: { select: { name: true } } },
      orderBy: { title: 'asc' },
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error('DB error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}