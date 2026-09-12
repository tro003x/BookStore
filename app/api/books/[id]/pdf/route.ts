import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const preview = url.searchParams.get('preview') === 'true';

    const book = await prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        pdfStoragePath: true,
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Book is not available' },
        { status: 403 }
      );
    }

    if (!book.pdfStoragePath) {
      return NextResponse.json(
        { error: 'PDF not uploaded for this book' },
        { status: 404 }
      );
    }

    // Access check
    const user = await getUserFromRequest(req);

    const hasPurchased = user
      ? !!(await prisma.purchase.findFirst({
          where: {
            userId: user.id,
            items: { some: { bookId: id } },
          },
          select: { id: true },
        }))
      : false;

    // Preview allowed for anyone (first 12 pages)
    // Full access requires purchase
    if (!preview && !hasPurchased) {
      return NextResponse.json(
        { error: 'Purchase required to read this book' },
        { status: 403 }
      );
    }

    // Generate short-lived signed URL (60 seconds)
    const { data, error: signError } = await supabase.storage
      .from('books')
      .createSignedUrl(book.pdfStoragePath, 3600);

    if (signError || !data) {
      console.error('Signed URL error:', signError);
      return NextResponse.json(
        { error: 'Failed to generate PDF URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.signedUrl,
      preview,
      maxPages: preview ? 12 : null,
      title: book.title,
    });
  } catch (error: any) {
    console.error('PDF route error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}