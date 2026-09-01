import { prisma } from '@/lib/prisma';
import BookCard from '@/components/BookCard';

export default async function HomePage() {
  const books = await prisma.book.findMany({
    where: { status: 'APPROVED' },
    include: { category: true },
    orderBy: { title: 'asc' },
  });

  // Convert Decimal to number
  const serializedBooks = books.map((book) => ({
    ...book,
    price: Number(book.price),
  }));

  return (
    <div className="min-h-screen bg-[#EFE9DC]">
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-['Fraunces'] text-3xl font-semibold mb-8 text-[#1A1D1E]">Catalog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serializedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </main>
    </div>
  );
}