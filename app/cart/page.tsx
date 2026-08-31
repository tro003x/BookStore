'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
  };
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          setItems(data?.items || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const removeItem = async (itemId: string) => {
    await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
    setItems(items.filter((item) => item.id !== itemId));
  };

  const checkout = async () => {
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const total = items.reduce((sum, item) => sum + Number(item.book.price) * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="font-['Fraunces'] text-2xl font-semibold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty — browse books to get started.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-[#EFE9DC] border border-[#C9BFA8] rounded p-4 flex justify-between items-center">
                <div>
                  <h2 className="font-['Fraunces'] font-medium">{item.book.title}</h2>
                  <p className="text-sm text-[#1A1D1E]/70">{item.book.author}</p>
                  <p className="font-['IBM_Plex_Mono'] text-[#A85C32]">${Number(item.book.price).toFixed(2)} × {item.quantity}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-[#A85C32] hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <p className="font-['IBM_Plex_Mono'] text-lg">Total: ${total.toFixed(2)}</p>
            <button
              onClick={checkout}
              className="bg-[#4B5D45] text-white px-6 py-2 rounded hover:opacity-90"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}