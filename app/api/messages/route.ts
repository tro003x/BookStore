import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function allowedChatRoles(myRole: string): string[] {
  switch (myRole) {
    case 'ADMIN': return ['AUTHOR', 'PUBLISHER'];
    case 'AUTHOR': return ['ADMIN', 'PUBLISHER'];
    case 'PUBLISHER': return ['ADMIN', 'AUTHOR'];
    default: return []; // READER cannot chat
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = allowedChatRoles(user.role);
    if (allowedRoles.length === 0) {
      return NextResponse.json({ contacts: [] });
    }

    const contacts = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        role: { in: allowedRoles as any },
        emailVerified: { not: null },
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });

    const unreadBySender = await prisma.message.groupBy({
      by: ['senderId'],
      where: { receiverId: user.id, read: false },
      _count: { _all: true },
    });
    const unreadMap = new Map(
      unreadBySender.map((u) => [u.senderId, u._count._all])
    );

    const contactsWithMeta = await Promise.all(
      contacts.map(async (c) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId: c.id },
              { senderId: c.id, receiverId: user.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, senderId: true },
        });
        return {
          ...c,
          unread: unreadMap.get(c.id) || 0,
          lastMessage: lastMessage?.content || null,
          lastMessageAt: lastMessage?.createdAt || null,
        };
      })
    );

    contactsWithMeta.sort((a, b) => {
      const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bt - at;
    });

    return NextResponse.json({ contacts: contactsWithMeta });
  } catch (error: any) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ contacts: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, content } = await req.json();

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { role: true },
    });
    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const allowed = allowedChatRoles(user.role);
    if (!allowed.includes(receiver.role)) {
      return NextResponse.json({ error: 'Cannot message this user' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content: content.trim(),
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}