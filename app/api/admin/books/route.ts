import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

// GET: list all books (admin)
export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const books = await prisma.book.findMany({
      include: {
        category: true,
        publisher: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Admin books GET error:', error);
    return NextResponse.json({ error: 'Failed to load books' }, { status: 500 });
  }
}

// POST: create a book as ADMIN (status = APPROVED directly)
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const pdf = formData.get('pdf') as File | null;
    const cover = formData.get('cover') as File | null;

    if (!title || !author || isNaN(price) || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Upload PDF (sanitize filename)
    let pdfPath: string | null = null;
    if (pdf && pdf.size > 0) {
      const safeName = pdf.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      pdfPath = `books/${Date.now()}-${safeName}`;
      const { error: pdfError } = await supabase.storage
        .from('books')
        .upload(pdfPath, pdf, { contentType: 'application/pdf' });

      if (pdfError) {
        console.error('PDF upload failed:', pdfError);
        return NextResponse.json(
          { error: 'PDF upload failed: ' + pdfError.message },
          { status: 500 }
        );
      }
    }

    // Upload cover
    let coverUrl: string | null = null;
    if (cover && cover.size > 0) {
      const safeName = cover.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const coverPath = `covers/${Date.now()}-${safeName}`;
      const { error: coverError } = await supabase.storage
        .from('covers')
        .upload(coverPath, cover, { contentType: cover.type });

      if (!coverError) {
        const { data: urlData } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath);
        coverUrl = urlData.publicUrl;
      } else {
        console.error('Cover upload failed:', coverError);
      }
    }

    // Pick any publisher — admin-created books need one for the FK
    let publisher = await prisma.publisher.findFirst();

    // If no publisher exists, create a system publisher using the admin's user
    if (!publisher) {
      publisher = await prisma.publisher.create({
        data: {
          userId: user.id,
          name: 'BoiStore Official',
          email: user.email || 'admin@boistore.com',
          approved: true,
          verificationStatus: 'APPROVED',
        },
      });
    }

    const book = await prisma.book.create({
      data: {
        title,
        authorName: author, // ← FIXED: was `author`
        description: description || null,
        price,
        status: 'APPROVED',
        paymentStatus: 'PAID',
        publisherId: publisher.id,
        categoryId,
        pdfStoragePath: pdfPath,
        coverImageUrl: coverUrl,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    console.error('Admin book create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create book' },
      { status: 500 }
    );
  }
}