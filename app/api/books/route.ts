import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  const where: any = { status: 'APPROVED' };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { authorName: { contains: q, mode: 'insensitive' } },
      { publisher: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const books = await prisma.book.findMany({
    where,
    include: { category: true, publisher: { select: { name: true } } },
    orderBy: { title: 'asc' },
  });

  return NextResponse.json(books);
}