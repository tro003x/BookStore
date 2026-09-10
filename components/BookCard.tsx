'use client';

import { useRouter } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import StarRating from './StarRating';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const categoryColors: Record<string, string> = {
  Science: '#14B8A6',
  Fiction: '#C97B3C',
  Biography: '#7A5C8F',
  'Self-Help': '#3C6E8F',
  History: '#8F6B3C',
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
      className="overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-white cursor-pointer flex flex-col"
    >
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          {book.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-[#F5F2EC] flex items-center justify-center text-[#6B7280] text-sm">
              No cover
            </div>
          )}
        </AspectRatio>
        <div
          className="absolute left-0 top-0 w-1 h-full"
          style={{ backgroundColor: color }}
        />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="font-['Fraunces'] text-lg line-clamp-1 hover:text-[#14B8A6] transition-colors">
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

      <CardContent className="flex-1">
        <p className="font-['IBM_Plex_Mono'] text-[#C97B3C] font-bold text-lg">
          ${price.toFixed(2)}
        </p>
      </CardContent>

      <CardFooter
        className="flex justify-center gap-2 pt-3 pb-4 bg-white border-t border-[#F5F2EC]"
        onClick={(e) => e.stopPropagation()}
      >
        <AddToCartButton bookId={book.id} />
      </CardFooter>
    </Card>
  );
}