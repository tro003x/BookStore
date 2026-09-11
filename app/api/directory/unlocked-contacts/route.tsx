import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ contacts: [] });
    }

    const unlocks = await prisma.contactUnlock.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: 'desc' },
    });

    const contacts = await Promise.all(
      unlocks.map(async (unlock) => {
        try {
          if (unlock.profileType === 'AUTHOR') {
            const author = await prisma.author.findUnique({
              where: { id: unlock.profileId },
              include: { user: { select: { email: true } } },
            });
            if (!author) return null;
            return {
              id: author.id,
              name: author.name,
              email: author.user.email,
              phone: author.phone,
              type: 'AUTHOR' as const,
              unlockedAt: unlock.unlockedAt.toISOString(),
            };
          }
          if (unlock.profileType === 'PUBLISHER') {
            const publisher = await prisma.publisher.findUnique({
              where: { id: unlock.profileId },
              include: { user: { select: { email: true } } },
            });
            if (!publisher) return null;
            return {
              id: publisher.id,
              name: publisher.name,
              email: publisher.user.email,
              phone: publisher.phone,
              type: 'PUBLISHER' as const,
              unlockedAt: unlock.unlockedAt.toISOString(),
            };
          }
          return null;
        } catch (innerError) {
          console.error('Single contact fetch failed:', innerError);
          return null;
        }
      })
    );

    return NextResponse.json({
      contacts: contacts.filter(Boolean),
    });
  } catch (error) {
    console.error('Unlocked contacts error:', error);
    // Always return valid JSON so client doesn't crash
    return NextResponse.json({ contacts: [] });
  }
}