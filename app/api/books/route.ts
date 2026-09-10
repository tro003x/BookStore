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
    include: {
      category: true,
      publisher: { select: { name: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { title: 'asc' },
  });

  const serialized = books.map((book) => {
    const reviewCount = book.reviews.length;
    const averageRating =
      reviewCount > 0
        ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    return {
      ...book,
      price: Number(book.price),
      averageRating,
      reviewCount,
    };
  });

  return NextResponse.json(serialized);
} 