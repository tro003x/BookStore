'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, BookOpen, LogOut, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Hide navbar on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-0 right-0 z-50 px-4 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-32'
      }`}
    >
      <nav className="mx-auto max-w-7xl bg-white rounded-2xl shadow-lg border border-[#E5E7EB] px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-['Fraunces'] text-xl font-semibold text-[#1A1D1E]">
          BoiStore
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/catalog"
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              pathname === '/catalog'
                ? 'bg-[#F5F6F7] text-[#1A1D1E] font-medium'
                : 'text-[#1A1D1E]/80 hover:bg-[#F5F6F7]'
            }`}
          >
            Catalog
          </Link>
          <Link
            href="/directory"
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              pathname === '/directory'
                ? 'bg-[#F5F6F7] text-[#1A1D1E] font-medium'
                : 'text-[#1A1D1E]/80 hover:bg-[#F5F6F7]'
            }`}
          >
            Directory
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/cart"
                className="relative p-2 rounded-xl hover:bg-[#F5F6F7] transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-[#1A1D1E]" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[#F5F6F7] transition-colors cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#4B5D45] text-white text-sm">
                      {session.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm text-[#1A1D1E]">
                    {session.user?.name?.split(' ')[0] || 'User'}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {session.user?.role === 'ADMIN' && (
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/admin')}
                      className="flex items-center gap-2 w-full cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  {session.user?.role === 'PUBLISHER' && (
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/publisher')}
                      className="flex items-center gap-2 w-full cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Publisher Dashboard
                    </DropdownMenuItem>
                  )}
                  {session.user?.role === 'AUTHOR' && (
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/author')}
                      className="flex items-center gap-2 w-full cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Author Dashboard
                    </DropdownMenuItem>
                  )}
                  {session.user?.role === 'READER' && (
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/reader')}
                      className="flex items-center gap-2 w-full cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" /> My Library
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 w-full cursor-pointer text-red-600"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-[#1A1D1E] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#1A1D1E]/90 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}