'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          const count = data?.items?.length || 0;
          setCartCount(count);
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
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
              <Link href="/cart" className="relative">
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#4B5D45] text-[#EFE9DC] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/purchases" className="text-sm hover:underline">
  My Purchases
</Link>
              <button
                onClick={() => signOut()}
                className="text-sm hover:underline"
              >
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