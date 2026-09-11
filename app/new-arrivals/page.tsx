import { prisma } from '@/lib/prisma';
import BookCard from '@/components/BookCard';

export const revalidate = 60;

export default async function NewArrivalsPage() {
  const books = await prisma.book.findMany({
    where: { status: 'APPROVED' },
    include: {
      category: true,
      reviews: { select: { rating: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 24,
  });

  const serialized = books.map((b) => {
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
            New Arrivals
          </h1>
          <h2 className="text-base text-[#6B7280] font-normal">
            The latest additions to BoiStore
          </h2>
        </div>

        {serialized.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] py-16 text-center">
            <p className="text-sm text-[#6B7280]">No books yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {serialized.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}