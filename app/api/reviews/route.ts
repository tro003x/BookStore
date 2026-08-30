import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

// GET reviews for a book
export async function GET(req: Request) {
  const url = new URL(req.url);
  const bookId = url.searchParams.get('bookId');

  if (!bookId) {
    return NextResponse.json({ error: 'bookId required' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { bookId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reviews);
}

// POST a review (must have purchased the book)
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookId, rating, text } = await req.json();

  if (!bookId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }

  // Check if user purchased this book
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      items: { some: { bookId } },
    },
  });

  if (!purchase) {
    return NextResponse.json(
      { error: 'You must purchase this book to review it' },
      { status: 403 }
    );
  }

  // Check if user already reviewed this book
  const existing = await prisma.review.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'You already reviewed this book' },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      bookId,
      rating,
      text,
    },
  });

  return NextResponse.json(review, { status: 201 });
}