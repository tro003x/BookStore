import Link from 'next/link';
import AddToCartButton from './AddToCartButton';

const categoryColors: Record<string, string> = {
  'Science': '#4B5D45',
  'Fiction': '#A85C32',
  'Biography': '#7A5C8F',
  'Self-Help': '#3C6E8F',
  'History': '#8F6B3C',
};

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    category: { name: string };
  };
}

export default function BookCard({ book }: BookCardProps) {
  const color = categoryColors[book.category.name] || '#4B5D45';

  return (
    <div className="flex bg-[#EFE9DC] rounded-r-[10px] shadow hover:shadow-lg transition-shadow overflow-hidden">
      <div className="w-2 shrink-0" style={{ backgroundColor: color }} />
      <div className="p-4 flex-1">
        <Link href={`/book/${book.id}`}>
          <h3 className="font-['Fraunces'] font-medium text-lg line-clamp-2 hover:underline">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-[#1A1D1E]/70">{book.author}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="font-['IBM_Plex_Mono'] text-[#A85C32] font-bold">
            ${Number(book.price).toFixed(2)}
          </span>
          <AddToCartButton bookId={book.id} />
        </div>
      </div>
    </div>
  );
}