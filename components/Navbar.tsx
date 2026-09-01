'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    const controller = new AbortController();

    fetch('/api/cart', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const count = data?.items?.length || 0;
        const badge = document.getElementById('cart-badge');
        if (badge) {
          badge.textContent = count > 0 ? String(count) : '';
          badge.style.display = count > 0 ? 'flex' : 'none';
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [session]);

  return (
    <nav className="bg-[#EFE9DC] border-b border-[#C9BFA8] px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-['Fraunces'] text-xl font-semibold text-[#1A1D1E]">
          BoiStore
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm hover:underline">
            Catalog
          </Link>

          {session ? (
            <>
              {session.user?.role === 'ADMIN' && (
                <Link href="/dashboard/admin" className="text-sm hover:underline">
                  Admin
                </Link>
              )}
              {session.user?.role === 'PUBLISHER' && (
                <Link href="/dashboard/publisher" className="text-sm hover:underline">
                  Publisher
                </Link>
              )}
              {session.user?.role === 'READER' && (
                <Link href="/dashboard/reader" className="text-sm hover:underline">
                  My Library
                </Link>
              )}
              <Link href="/cart" className="relative">
                <span className="text-xl">🛒</span>
                <span
                  id="cart-badge"
                  className="absolute -top-1 -right-2 bg-[#4B5D45] text-[#EFE9DC] text-xs rounded-full w-5 h-5 items-center justify-center hidden"
                >
                  0
                </span>
              </Link>
              <button onClick={() => signOut()} className="text-sm hover:underline">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}