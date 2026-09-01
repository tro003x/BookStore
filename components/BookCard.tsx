import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const categoryColors: Record<string, string> = {
  Science: '#4B5D45',
  Fiction: '#A85C32',
  Biography: '#7A5C8F',
  'Self-Help': '#3C6E8F',
  History: '#8F6B3C',
};

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    price: number | { toFixed: (digits: number) => string };
    coverImageUrl: string | null;
    category: { name: string };
  };
}

export default function BookCard({ book }: BookCardProps) {
  const color = categoryColors[book.category.name] || '#4B5D45';
  const price = typeof book.price === 'number' ? book.price : parseFloat(book.price.toString());

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
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
            <div className="w-full h-full bg-[#C9BFA8] flex items-center justify-center text-[#1A1D1E]/50">
              No cover
            </div>
          )}
        </AspectRatio>
        <div
          className="absolute left-0 top-0 w-2 h-full"
          style={{ backgroundColor: color }}
        />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="font-['Fraunces'] text-lg line-clamp-1">
          <Link href={`/book/${book.id}`} className="hover:underline">
            {book.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-[#1A1D1E]/70">{book.author}</p>
      </CardHeader>

      <CardContent>
        <p className="font-['IBM_Plex_Mono'] text-[#A85C32] font-bold">
          ${price.toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <AddToCartButton bookId={book.id} />
      </CardFooter>
    </Card>
  );
}