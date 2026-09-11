import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/AddToCartButton';
import ReviewSection from '@/components/ReviewSection';
import StarRating from '@/components/StarRating';
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
      reviews: { select: { rating: true } },
    },
  });

  if (!book) {
    notFound();
  }

  const reviewCount = book.reviews.length;
  const averageRating =
    reviewCount > 0
      ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Cover */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#E5E7EB] shadow-sm">
              {book.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B7280] text-sm">
                  No cover
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 flex flex-col">
            <h1 className="font-['Fraunces'] text-3xl md:text-4xl font-semibold text-[#1A1D1E] mb-2">
              {book.title}
            </h1>
            <p className="text-base text-[#6B7280] mb-4">by {book.authorName}</p>

            {/* Rating */}
            <div className="mb-5">
              <StarRating
                rating={averageRating}
                count={reviewCount}
                size="md"
              />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6B7280] mb-5">
              <span>
                <span className="text-[#1A1D1E]/60">Category: </span>
                <span className="text-[#1A1D1E] font-medium">{book.category.name}</span>
              </span>
              <span>
                <span className="text-[#1A1D1E]/60">Publisher: </span>
                <span className="text-[#1A1D1E] font-medium">{book.publisher.name}</span>
              </span>
             
            </div>

            {/* Description */}
            {book.description && (
              <p className="text-[#1A1D1E]/80 leading-relaxed mb-6">
                {book.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-6">
              <span className="font-['IBM_Plex_Mono'] text-3xl font-bold text-[#A85C32]">
                ${Number(book.price).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-auto">
              <AddToCartButton bookId={book.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <ReviewSection bookId={book.id} />
      </div>
    </div>
  );
}