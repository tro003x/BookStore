import { prisma } from '@/lib/prisma';
import BookCard from '@/components/BookCard';

export const revalidate = 60;

export default async function BestsellersPage() {
  // Get top books by number of purchase items
  const books = await prisma.book.findMany({
    where: { status: 'APPROVED' },
    include: {
      category: true,
      reviews: { select: { rating: true } },
      _count: { select: { purchaseItems: true } },
    },
    orderBy: {
      purchaseItems: { _count: 'desc' },
    },
    take: 24,
  });

  const serialized = books
    .filter((b) => b._count.purchaseItems > 0) // only books that sold at least 1
    .map((b) => {
      const reviewCount = b.reviews.length;
      const averageRating =
        reviewCount > 0
          ? b.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
          : 0;
      return {
        ...b,
        price: Number(b.price),
        averageRating,
        reviewCount,
      };
    });

  return (
    <div className="min-h-screen bg-[#F5F2EC] px-4 py-10">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="font-['Fraunces'] text-4xl font-semibold text-[#1A1D1E] mb-2">
            Bestsellers
          </h1>
          <h2 className="text-base text-[#6B7280] font-normal">
            Most loved books on BoiStore
          </h2>
        </div>

        {serialized.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] py-16 text-center">
            <p className="text-sm text-[#6B7280]">
              No sales data yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {serialized.map((book, idx) => (
              <div key={book.id} className="relative">
                {idx < 3 && (
                  <span className="absolute -top-2 -left-2 z-10 h-8 w-8 rounded-full bg-[#A85C32] text-white text-xs font-bold flex items-center justify-center shadow-md">
                    #{idx + 1}
                  </span>
                )}
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}