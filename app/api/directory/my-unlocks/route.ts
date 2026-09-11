import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ unlocks: [], myAuthorId: null, myPublisherId: null });
    }

    const [unlocks, author, publisher] = await Promise.all([
      prisma.contactUnlock.findMany({
        where: { userId: user.id },
        select: { profileId: true, profileType: true },
      }),
      prisma.author.findUnique({
        where: { userId: user.id },
        select: { id: true },
      }),
      prisma.publisher.findUnique({
        where: { userId: user.id },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      unlocks,
      myAuthorId: author?.id || null,
      myPublisherId: publisher?.id || null,
    });
  } catch (error) {
    console.error('My unlocks error:', error);
    return NextResponse.json({ unlocks: [], myAuthorId: null, myPublisherId: null });
  }
}