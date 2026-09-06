import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { type, status } = await req.json(); // type: 'author' or 'publisher', status: 'APPROVED' or 'REJECTED'

  let result;
  if (type === 'author') {
    result = await prisma.author.update({
      where: { id },
      data: { verificationStatus: status },
    });
  } else if (type === 'publisher') {
    result = await prisma.publisher.update({
      where: { id },
      data: { verificationStatus: status },
    });
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  return NextResponse.json(result);
}