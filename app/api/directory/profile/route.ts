import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const type = url.searchParams.get('type');

  if (!id || !type) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  let profile;
  if (type === 'author') {
    profile = await prisma.author.findUnique({
      where: { id, verificationStatus: 'APPROVED' },
      include: { user: { select: { email: true } } },
    });
  } else if (type === 'publisher') {
    profile = await prisma.publisher.findUnique({
      where: { id, verificationStatus: 'APPROVED' },
      include: { user: { select: { email: true } } },
    });
  }

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}