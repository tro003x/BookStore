import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
  });

  if (!book || !book.pdfStoragePath) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const preview = url.searchParams.get('preview') === 'true';

  const user = await getUserFromRequest(req);
  const hasPurchased = user
    ? await prisma.purchase.findFirst({
        where: {
          userId: user.id,
          items: { some: { bookId: id } },
        },
      })
    : false;

  if (!preview && !hasPurchased) {
    return NextResponse.json({ error: 'Purchase required' }, { status: 403 });
  }

  const { data, error } = await supabase.storage
    .from('books')
    .createSignedUrl(book.pdfStoragePath, 60);

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to generate PDF URL' }, { status: 500 });
  }

  return NextResponse.json({
    url: data.signedUrl,
    preview: preview,
    maxPages: preview ? 12 : null,
  });
}