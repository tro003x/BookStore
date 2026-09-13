import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: userId },
          { senderId: userId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Thread GET error:', error);
    return NextResponse.json({ messages: [] });
  }
}