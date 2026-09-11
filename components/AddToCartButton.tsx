'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AddToCartButton({ bookId }: { bookId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
        toast.success('Added to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });

      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error(error || 'Payment failed. Please try again.');
      }
    } catch {
      toast.error('Payment error. Please try again.');
    }
  };

  return (
    <div className="flex gap-2 justify-center w-full">
      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-[#4B5D45] hover:bg-[#3E4C39] hover:-translate-y-0.5 hover:shadow-md text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add to cart'}
      </button>
      <button
        onClick={handleBuyNow}
        className="bg-[#A85C32] hover:bg-[#8F4D2A] hover:-translate-y-0.5 hover:shadow-md text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
      >
        Buy Now
      </button>
    </div>
  );
}