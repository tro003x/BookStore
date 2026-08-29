import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'PUBLISHER' || !user.publisher) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData();
  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const categoryId = formData.get('categoryId') as string;
  const pdf = formData.get('pdf') as File;
  const cover = formData.get('cover') as File;

  if (!title || !author || !price || !categoryId || !pdf) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  // Upload PDF
  const pdfPath = `books/${Date.now()}-${pdf.name}`;
  const { error: pdfError } = await supabase.storage
    .from('books')
    .upload(pdfPath, pdf, { contentType: 'application/pdf' });
  if (pdfError) {
    return NextResponse.json({ error: 'PDF upload failed' }, { status: 500 });
  }

  // Upload cover
  let coverPath: string | null = null;
  if (cover) {
    coverPath = `covers/${Date.now()}-${cover.name}`;
    const { error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverPath, cover, { contentType: cover.type });
    if (coverError) {
      // Log but don't fail
      console.error('Cover upload failed:', coverError);
    }
  }

  const book = await prisma.book.create({
    data: {
      title,
      author,
      description,
      price,
      status: 'PENDING',
      publisherId: user.publisher.id,
      categoryId,
      pdfStoragePath: pdfPath,
      coverImageUrl: coverPath,
    },
  });

  return NextResponse.json(book, { status: 201 });
}