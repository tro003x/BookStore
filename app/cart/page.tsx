'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, ShoppingBag, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    authorName: string;
    price: number;
    coverImageUrl: string | null;
    category?: { name: string } | null;
  };
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          const cartItems = data?.items || [];
          setItems(cartItems);
          setSelected(new Set(cartItems.map((i: CartItem) => i.id)));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0 && selected.size < items.length;

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Removed from cart');
        const newItems = items.filter((i) => i.id !== itemId);
        setItems(newItems);
        const newSelected = new Set(selected);
        newSelected.delete(itemId);
        setSelected(newSelected);
      } else {
        toast.error('Failed to remove item');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(i.id)),
    [items, selected]
  );

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, i) => sum + Number(i.book.price) * i.quantity,
        0
      ),
    [selectedItems]
  );

  const totalCount = selectedItems.reduce((s, i) => s + i.quantity, 0);

  const checkout = async () => {
    if (selected.size === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: Array.from(selected) }),
      });

      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error(error || 'Payment failed. Please try again.');
        setCheckingOut(false);
      }
    } catch {
      toast.error('Payment error. Please try again.');
      setCheckingOut(false);
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
        <p className="text-sm text-[#6B7280]">Loading cart...</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#F5F2EC] py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[#1A1D1E] mb-1">
            Shopping Cart
          </h1>
          <p className="text-sm text-[#6B7280]">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] py-16 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#14B8A6]/10 mb-4">
              <ShoppingBag className="h-8 w-8 text-[#14B8A6]" />
            </div>
            <h2 className="font-['Fraunces'] text-xl font-semibold mb-2 text-[#1A1D1E]">
              Your cart is empty
            </h2>
            <p className="text-sm text-[#6B7280] mb-6">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/catalog"
              className="inline-block bg-[#4B5D45] hover:bg-[#3E4C39] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-3">
              {/* Select all */}
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm font-medium text-[#1A1D1E]">
                    Select All ({items.length})
                  </span>
                </label>
                {selected.size > 0 && (
                  <span className="text-xs text-[#6B7280]">
                    {selected.size} selected
                  </span>
                )}
              </div>

              {/* Items */}
              {items.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg border p-4 flex gap-4 transition-all ${
                      isSelected
                        ? 'border-[#14B8A6]/40 shadow-sm'
                        : 'border-[#E5E7EB]'
                    }`}
                  >
                    <div className="flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(item.id)}
                      />
                    </div>

                    <Link
                      href={`/book/${item.book.id}`}
                      className="w-20 h-28 rounded-md overflow-hidden bg-[#F5F2EC] border border-[#E5E7EB] shrink-0"
                    >
                      {item.book.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.book.coverImageUrl}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-[#D1D5DB]" />
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link
                        href={`/book/${item.book.id}`}
                        className="font-['Fraunces'] font-medium text-[#1A1D1E] hover:text-[#14B8A6] transition-colors line-clamp-2"
                      >
                        {item.book.title}
                      </Link>
                      <p className="text-sm text-[#6B7280] mt-0.5">
                        by {item.book.authorName}
                      </p>
                      {item.book.category && (
                        <span className="inline-block self-start mt-1.5 px-2 py-0.5 rounded-md bg-[#F5F2EC] text-[10px] font-medium text-[#6B7280] uppercase tracking-wide">
                          {item.book.category.name}
                        </span>
                      )}

                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-['IBM_Plex_Mono'] text-lg font-bold text-[#A85C32]">
                            ${Number(item.book.price).toFixed(2)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-xs text-[#6B7280]">
                              × {item.quantity}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-md text-[#6B7280] hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 sticky top-28">
                <h2 className="font-['Fraunces'] text-xl font-semibold text-[#1A1D1E] mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 pb-5 border-b border-[#E5E7EB]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Items selected</span>
                    <span className="text-[#1A1D1E] font-medium">
                      {totalCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="text-[#1A1D1E] font-medium">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Shipping</span>
                    <span className="text-[#16A34A] font-medium">
                      Digital — free
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline py-5">
                  <span className="text-base font-semibold text-[#1A1D1E]">
                    Total
                  </span>
                  <span className="font-['IBM_Plex_Mono'] text-2xl font-bold text-[#A85C32]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={checkout}
                  disabled={selected.size === 0 || checkingOut}
                  className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white h-11 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkingOut ? (
                    'Redirecting...'
                  ) : (
                    <>
                      Checkout {selected.size > 0 && `(${selected.size})`}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <Link
                  href="/catalog"
                  className="block text-center mt-3 text-sm text-[#6B7280] hover:text-[#14B8A6] transition-colors"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}