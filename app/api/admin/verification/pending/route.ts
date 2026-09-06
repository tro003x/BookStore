import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const authors = await prisma.author.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: { select: { email: true, name: true } } },
  });

  const publishers = await prisma.publisher.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: { select: { email: true, name: true } } },
  });

  // Generate signed URLs for each author
  const authorsWithUrls = await Promise.all(
    authors.map(async (author) => {
      let nidUrl = null;
      let selfieUrl = null;

      if (author.nidPath) {
        const { data } = await supabase.storage
          .from('verification')
          .createSignedUrl(author.nidPath, 60);
        nidUrl = data?.signedUrl || null;
      }

      if (author.selfiePath) {
        const { data } = await supabase.storage
          .from('verification')
          .createSignedUrl(author.selfiePath, 60);
        selfieUrl = data?.signedUrl || null;
      }

      return { ...author, nidUrl, selfieUrl };
    })
  );

  // Generate signed URLs for each publisher
  const publishersWithUrls = await Promise.all(
    publishers.map(async (pub) => {
      let nidUrl = null;
      let selfieUrl = null;

      if (pub.nidPath) {
        const { data } = await supabase.storage
          .from('verification')
          .createSignedUrl(pub.nidPath, 60);
        nidUrl = data?.signedUrl || null;
      }

      if (pub.selfiePath) {
        const { data } = await supabase.storage
          .from('verification')
          .createSignedUrl(pub.selfiePath, 60);
        selfieUrl = data?.signedUrl || null;
      }

      return { ...pub, nidUrl, selfieUrl };
    })
  );

  return NextResponse.json({
    authors: authorsWithUrls,
    publishers: publishersWithUrls,
  });
}