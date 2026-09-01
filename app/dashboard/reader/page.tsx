'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PurchaseItem {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    coverImageUrl: string | null;
  };
  priceAtPurchase: number;
}

export default function ReaderLibrary() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'READER') {
      router.push('/');
      return;
    }

    const fetchPurchases = async () => {
      const res = await fetch('/api/purchases');
      const data = await res.json();
      const allItems = data.flatMap((p: { items: PurchaseItem[] }) => p.items);
      setItems(allItems);
      setLoading(false);
    };

    fetchPurchases();
  }, [status, session, router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#EFE9DC] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-['Fraunces'] text-3xl font-semibold mb-6">My Library</h1>
        {items.length === 0 ? (
          <p>No books purchased yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-['Fraunces'] font-medium">{item.book.title}</h3>
                <p className="text-sm text-gray-600">{item.book.author}</p>
                <button
                  onClick={() => router.push(`/book/${item.book.id}?read=true`)}
                  className="mt-2 bg-[#4B5D45] text-white px-4 py-1 rounded text-sm"
                >
                  Read
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}