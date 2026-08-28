'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PurchaseItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  book: {
    title: string;
    author: string;
  };
}

interface Purchase {
  id: string;
  purchasedAt: string;
  totalAmount: number;
  items: PurchaseItem[];
}

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/purchases')
        .then((res) => res.json())
        .then((data) => {
          setPurchases(data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="font-['Fraunces'] text-2xl font-semibold mb-4">My Purchases</h1>
      {purchases.length === 0 ? (
        <p>You have not purchased any books yet.</p>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-[#EFE9DC] border border-[#C9BFA8] rounded p-4">
              <p className="text-sm text-[#1A1D1E]/70">
                Purchased: {new Date(purchase.purchasedAt).toLocaleDateString()}
              </p>
              <p className="font-['IBM_Plex_Mono'] text-[#A85C32]">
                Total: ${Number(purchase.totalAmount).toFixed(2)}
              </p>
              <div className="mt-2 space-y-1">
                {purchase.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.book.title} × {item.quantity}</span>
                    <span className="font-['IBM_Plex_Mono']">
                      ${Number(item.priceAtPurchase).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}