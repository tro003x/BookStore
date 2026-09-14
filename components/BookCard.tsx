'use client';

import { useRouter } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import StarRating from './StarRating';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const categoryColors: Record<string, string> = {
  Science: '#14B8A6',
  Fiction: '#C97B3C',
  Biography: '#7A5C8F',
  'Self-Help': '#3C6E8F',
  History: '#8F6B3C',
  Poetry: '#B85C7A',
  Novel: '#C97B3C',
  Fantasy: '#6B4B9E',
  Mystery: '#4A5568',
  Romance: '#D9528A',
  Technology: '#2D6E7E',
  Philosophy: '#8B6F47',
};

interface BookCardProps {
  book: {
    id: string;
    title: string;
    authorName: string;
    price: number;
    coverImageUrl: string | null;
    category: { name: string };
    averageRating?: number;
    reviewCount?: number;
  };
}

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter();
  const color = categoryColors[book.category.name] || '#14B8A6';
  const price = typeof book.price === 'number' ? book.price : parseFloat(String(book.price));

  const handleCardClick = () => {
    router.push(`/book/${book.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="group overflow-hidden border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 bg-white cursor-pointer flex flex-col rounded-lg py-0 gap-0"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F2EC]">
        {book.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6B7280] text-sm">
            No cover
          </div>
        )}

        {/* Category spine bar */}
        <div
          className="absolute left-0 top-0 w-1 h-full"
          style={{ backgroundColor: color }}
        />

        {/* Bottom gradient for depth */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
      </div>

      {/* Title + author + rating */}
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="font-['Fraunces'] text-lg line-clamp-1 transition-colors duration-200 group-hover:text-[#14B8A6]">
          {book.title}
        </CardTitle>
        <p className="text-sm text-[#6B7280]">{book.authorName}</p>
        <div className="pt-1">
          <StarRating
            rating={book.averageRating || 0}
            count={book.reviewCount || 0}
          />
        </div>
      </CardHeader>

      {/* Price */}
      <CardContent className="px-4 flex-1 pb-4">
        <p className="font-['IBM_Plex_Mono'] text-[#C97B3C] font-bold text-lg">
          ${price.toFixed(2)}
        </p>
      </CardContent>

      {/* Buttons */}
      <CardFooter
        className="flex justify-center gap-2 px-4 pt-4 pb-4 bg-white border-t border-[#F5F2EC]"
        onClick={(e) => e.stopPropagation()}
      >
        <AddToCartButton bookId={book.id} />
      </CardFooter>
    </Card>
  );
}