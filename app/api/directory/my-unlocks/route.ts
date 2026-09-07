import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ unlocks: [] });
    }

    const unlocks = await prisma.contactUnlock.findMany({
      where: { userId: user.id },
      select: {
        profileId: true,
        profileType: true,
      },
    });

    return NextResponse.json({ unlocks });
  } catch (error) {
    console.error('My unlocks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}