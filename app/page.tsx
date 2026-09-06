import { prisma } from '@/lib/prisma';
import BookCard from '@/components/BookCard';

export default async function HomePage() {
  const books = await prisma.book.findMany({
    where: { status: 'APPROVED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  const serializedBooks = books.map((book) => ({
    ...book,
    price: Number(book.price),
  }));

  return (
    <div className="min-h-screen bg-[#EFE9DC]">
      <section className="bg-[#1A1D1E] text-[#EFE9DC] py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-['Fraunces'] text-5xl md:text-6xl font-semibold mb-4">BoiStore</h1>
          <p className="text-xl md:text-2xl text-[#EFE9DC]/80 mb-8">Discover, read, and buy PDF books instantly.</p>
          <a href="/catalog" className="bg-[#4B5D45] hover:bg-[#4B5D45]/90 text-white px-8 py-3 rounded-lg inline-block">Browse Catalog</a>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="font-['Fraunces'] text-3xl font-semibold mb-8 text-[#1A1D1E]">Featured Books</h2>
        {serializedBooks.length === 0 ? (
          <p className="text-[#1A1D1E]/60">No books available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serializedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <a href="/catalog" className="border border-[#4B5D45] text-[#4B5D45] px-6 py-2 rounded-lg hover:bg-[#4B5D45] hover:text-white inline-block">View All Books</a>
        </div>
      </section>
    </div>
  );
}