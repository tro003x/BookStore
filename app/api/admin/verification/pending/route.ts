import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

async function signPath(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage
    .from('verification')
    .createSignedUrl(path, 600); // 10 min
  return data?.signedUrl || null;
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const authors = await prisma.author.findMany({
      where: {
        verificationStatus: 'PENDING',
        user: { emailVerified: { not: null } }, // only verified emails
      },
      include: {
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const publishers = await prisma.publisher.findMany({
      where: {
        verificationStatus: 'PENDING',
        user: { emailVerified: { not: null } }, // only verified emails
      },
      include: {
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate signed URLs for each author's docs
    const authorsWithDocs = await Promise.all(
      authors.map(async (a) => ({
        ...a,
        nidUrl: await signPath(a.nidPath),
        selfieUrl: await signPath(a.selfiePath),
        cvUrl: await signPath(a.cvPath),
        certificateUrl: await signPath(a.certificatePath),
      }))
    );

    // Generate signed URLs for each publisher's docs
    const publishersWithDocs = await Promise.all(
      publishers.map(async (p) => ({
        ...p,
        nidUrl: await signPath(p.nidPath),
        selfieUrl: await signPath(p.selfiePath),
      }))
    );

    return NextResponse.json({
      authors: authorsWithDocs,
      publishers: publishersWithDocs,
    });
  } catch (error: any) {
    console.error('Pending verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load pending list' },
      { status: 500 }
    );
  }
}