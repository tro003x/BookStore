import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/AddToCartButton';
import ReviewSection from '@/components/ReviewSection';
import { notFound } from 'next/navigation';

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      category: true,
      publisher: { select: { name: true } },
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-[#EFE9DC] rounded p-6 shadow">
        <h1 className="font-['Fraunces'] text-3xl font-semibold">{book.title}</h1>
        <p className="text-xl text-[#1A1D1E]/70">by {book.author}</p>
        <p className="text-[#1A1D1E]/80 mt-2">{book.description}</p>
        <p className="font-['IBM_Plex_Mono'] text-2xl font-bold mt-4 text-[#A85C32]">
          ${Number(book.price).toFixed(2)}
        </p>
        <p className="text-sm text-[#1A1D1E]/60">Category: {book.category.name}</p>
        <p className="text-sm text-[#1A1D1E]/60">Publisher: {book.publisher.name}</p>
        <div className="mt-4">
          <AddToCartButton bookId={book.id} />
        </div>
      </div>

      <ReviewSection bookId={book.id} />
    </div>
  );
}