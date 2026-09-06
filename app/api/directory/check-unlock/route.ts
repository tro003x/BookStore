import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ unlocked: false });
    }

    const url = new URL(req.url);
    const profileId = url.searchParams.get('profileId');
    const profileType = url.searchParams.get('profileType')?.toUpperCase();

    if (!profileId || !profileType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const unlock = await prisma.contactUnlock.findUnique({
      where: {
        userId_profileId_profileType: {
          userId: user.id,
          profileId,
          profileType,
        },
      },
    });

    return NextResponse.json({ unlocked: !!unlock });
  } catch (error) {
    console.error('Check unlock error:', error);
    return NextResponse.json({ unlocked: false });
  }
}