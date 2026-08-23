import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    include: { items: { include: { book: true } } },
    orderBy: { purchasedAt: 'desc' },
  });

  return NextResponse.json(purchases);
}