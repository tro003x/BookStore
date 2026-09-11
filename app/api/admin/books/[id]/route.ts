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
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const pdf = formData.get('pdf') as File | null;
    const cover = formData.get('cover') as File | null;

    const updateData: any = {
      title,
      authorName: author, // ← FIXED: was `author`
      description: description || null,
      price,
      categoryId,
    };

    // Optional PDF replace
    if (pdf && pdf.size > 0) {
      const safeName = pdf.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const pdfPath = `books/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from('books')
        .upload(pdfPath, pdf, { contentType: 'application/pdf' });
      if (!error) updateData.pdfStoragePath = pdfPath;
    }

    // Optional cover replace
    if (cover && cover.size > 0) {
      const safeName = cover.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const coverPath = `covers/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from('covers')
        .upload(coverPath, cover, { contentType: cover.type });
      if (!error) {
        const { data } = supabase.storage.from('covers').getPublicUrl(coverPath);
        updateData.coverImageUrl = data.publicUrl;
      }
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedBook);
  } catch (error: any) {
    console.error('Admin book update error:', error);
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin book delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}