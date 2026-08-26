import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

export default async function HomePage() {
  const books = await prisma.book.findMany({
    where: { status: 'APPROVED' },
    include: { category: true },
    orderBy: { title: 'asc' },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p className="text-gray-600">by {book.author}</p>
           <p className="text-gray-800 font-bold">${Number(book.price).toFixed(2)}</p>
            <p className="text-sm text-gray-500">{book.category.name}</p>
            <div className="mt-2 flex gap-2">
              <Link href={`/book/${book.id}`} className="text-blue-500 hover:underline">
                View Details
              </Link>
              <AddToCartButton bookId={book.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}