import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const publishers = await prisma.publisher.findMany({
    where: { approved: false },
    include: { user: { select: { email: true, name: true } } },
  });

  return NextResponse.json(publishers);
}