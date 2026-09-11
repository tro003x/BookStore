'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Home, Search } from 'lucide-react';

interface PurchaseItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  book: {
    id: string;
    title: string;
    authorName: string;
    coverImageUrl: string | null;
    category?: { name: string } | null;
  };
}

export default function ReaderDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'READER') {
      router.push('/');
      return;
    }

    const fetchPurchases = async () => {
      try {
        const res = await fetch('/api/purchases');
        const data = await res.json();
        const allItems = Array.isArray(data) ? data.flatMap((p: any) => p.items) : [];
        setItems(allItems);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [status, session, router]);

  const filtered = query
    ? items.filter((i) =>
        i.book.title.toLowerCase().includes(query.toLowerCase()) ||
        i.book.authorName.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  if (loading) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
        <p className="text-sm text-[#6B7280]">Loading library...</p>
      </div>
    </div>
  );
}

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-['Fraunces'] text-3xl font-semibold text-[#1A1D1E]">
              My Library
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#0D9488] text-xs font-medium">
              {items.length} {items.length === 1 ? 'book' : 'books'}
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            Your personal collection of purchased PDFs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#1A1D1E] hover:bg-[#F5F2EC] transition-colors"
          >
            <Home className="h-4 w-4" /> Back to Store
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4B5D45] hover:bg-[#3E4C39] text-white text-sm font-medium transition-colors"
          >
            <BookOpen className="h-4 w-4" /> Browse Catalog
          </Link>
        </div>
      </div>

      {/* Search */}
      {items.length > 0 && (
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search your library..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-white text-sm text-[#1A1D1E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6] transition"
            />
          </div>
        </div>
      )}

      {/* Empty */}
      {items.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] py-16 px-6 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#14B8A6]/10 mb-4">
            <BookOpen className="h-8 w-8 text-[#14B8A6]" />
          </div>
          <h2 className="font-['Fraunces'] text-xl font-semibold text-[#1A1D1E] mb-2">
            Your library is empty
          </h2>
          <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">
            Browse our catalog and start building your collection.
          </p>
          <Link
            href="/catalog"
            className="inline-block bg-[#4B5D45] hover:bg-[#3E4C39] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] py-12 text-center">
          <p className="text-sm text-[#6B7280]">No books match "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/read/${item.book.id}`}
              className="group flex flex-col"
            >
              {/* Cover */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#F5F2EC] border border-[#E5E7EB] shadow-sm group-hover:shadow-xl transition-all duration-200">
                {item.book.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.book.coverImageUrl}
                    alt={item.book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-[#D1D5DB]" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-xs font-medium bg-[#14B8A6] px-3 py-1 rounded-full">
                    Read →
                  </span>
                </div>
              </div>

              {/* Title + Author */}
              <div className="mt-2.5 px-0.5">
                <h3 className="font-medium text-sm text-[#1A1D1E] line-clamp-2 leading-snug">
                  {item.book.title}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">
                  {item.book.authorName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}