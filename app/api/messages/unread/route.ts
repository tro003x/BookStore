import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ count: 0 });

    const count = await prisma.message.count({
      where: { receiverId: user.id, read: false },
    });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}