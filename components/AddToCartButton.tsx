'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddToCartButton({ bookId }: { bookId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, quantity: 1 }),
      });
      if (res.ok) {
        alert('Added to cart');
      } else {
        alert('Failed to add');
      }
    } catch (error) {
      alert('Error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    const res = await fetch('/api/payment/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    });

    const { url } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-[#4B5D45] text-white px-3 py-1 rounded text-sm hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add to cart'}
      </button>
      <button
        onClick={handleBuyNow}
        className="bg-[#A85C32] text-white px-3 py-1 rounded text-sm hover:opacity-90"
      >
        Buy Now
      </button>
    </div>
  );
}