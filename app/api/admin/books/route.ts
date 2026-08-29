import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const books = await prisma.book.findMany({
    where: { status: 'PENDING' },
    include: { category: true, publisher: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(books);
}