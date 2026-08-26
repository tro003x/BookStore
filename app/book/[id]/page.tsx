import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/AddToCartButton';
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
      <h1 className="text-3xl font-bold">{book.title}</h1>
      <p className="text-xl text-gray-600">by {book.author}</p>
      <p className="text-gray-700 mt-2">{book.description}</p>
      <p className="text-2xl font-bold mt-4">${Number(book.price).toFixed(2)}</p>
      <p className="text-sm text-gray-500">Category: {book.category.name}</p>
      <p className="text-sm text-gray-500">Publisher: {book.publisher.name}</p>
      <div className="mt-4">
        <AddToCartButton bookId={book.id} />
      </div>
    </div>
  );
}