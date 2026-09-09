import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'PUBLISHER' || !user.publisher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const pdf = formData.get('pdf') as File;
    const cover = formData.get('cover') as File;

    if (!title || !author || !price || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingBook = await prisma.book.findUnique({
      where: { id, publisherId: user.publisher.id },
    });

    if (!existingBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const updateData: any = {
      title,
      authorName: author, // map to schema
      description,
      price,
      categoryId,
    };

    if (pdf) {
      const pdfPath = `books/${Date.now()}-${pdf.name}`;
      const { error } = await supabase.storage.from('books').upload(pdfPath, pdf);
      if (!error) {
        updateData.pdfStoragePath = pdfPath;
      }
    }

    if (cover) {
      const coverPath = `covers/${Date.now()}-${cover.name}`;
      const { error } = await supabase.storage.from('covers').upload(coverPath, cover);
      if (!error) {
        const { data } = supabase.storage.from('covers').getPublicUrl(coverPath);
        updateData.coverImageUrl = data.publicUrl;
      }
    }

    // If DRAFT+UNPAID, keep DRAFT; else PENDING
    if (existingBook.status === 'DRAFT' && existingBook.paymentStatus === 'UNPAID') {
      updateData.status = 'DRAFT';
    } else {
      updateData.status = 'PENDING';
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedBook);
  } catch (error: any) {
    console.error('Publisher update error:', error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'PUBLISHER' || !user.publisher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { id, publisherId: user.publisher.id },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Publisher delete error:', error);
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 });
  }
}