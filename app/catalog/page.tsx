import { prisma } from '@/lib/prisma';
import BookCard from '@/components/BookCard';
import Link from 'next/link';
import PaginationControls from '@/components/PaginationControls';

const BOOKS_PER_PAGE = 8;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));

  const [books, totalCount] = await Promise.all([
    prisma.book.findMany({
      where: { status: 'APPROVED' },
      include: {
        category: true,
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * BOOKS_PER_PAGE,
      take: BOOKS_PER_PAGE,
    }),
    prisma.book.count({ where: { status: 'APPROVED' } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / BOOKS_PER_PAGE));

  const serializedBooks = books.map((book) => {
    const reviewCount = book.reviews.length;
    const averageRating =
      reviewCount > 0
        ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    return {
      ...book,
      price: Number(book.price),
      averageRating,
      reviewCount,
    };
  });

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      {/* Hero */}
      <section className="bg-[#1A1D1E] text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-['Fraunces'] text-5xl md:text-6xl font-semibold mb-4">
            BoiStore
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-8">
            Discover, read, and buy PDF books instantly.
          </p>
          <Link
            href="/catalog"
            className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-8 py-3 rounded-xl inline-block font-medium transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-['Fraunces'] text-3xl font-semibold mb-8 text-[#1A1D1E]">
          Featured Books
        </h2>

        {serializedBooks.length === 0 ? (
          <p className="text-[#6B7280]">No books available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serializedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <PaginationControls currentPage={currentPage} totalPages={totalPages} />
        )}
      </section>
    </div>
  );
}