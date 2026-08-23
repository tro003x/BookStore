import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      publisher: { select: { name: true } },
    },
  });

  if (!book) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(book);
}