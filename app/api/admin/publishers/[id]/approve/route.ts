import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const publisher = await prisma.publisher.update({
      where: { id },
      data: { approved: true },
    });

    return NextResponse.json(publisher);
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}