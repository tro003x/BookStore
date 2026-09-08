'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Hide navbar on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="bg-[#EFE9DC] border-b border-[#C9BFA8] px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-['Fraunces'] text-xl font-semibold text-[#1A1D1E]">
          BoiStore
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/catalog" className="text-sm hover:underline">
            Catalog
          </Link>
          <Link href="/directory" className="text-sm hover:underline">
            Directory
          </Link>

          {session ? (
            <>
              <Link href="/cart" className="relative">
                <span className="text-xl">🛒</span>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-[#C9BFA8]/30 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#4B5D45] text-white">
                      {session.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">
                    Welcome, {session.user?.name?.split(' ')[0] || 'User'}
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
            <Link href="/login" className="text-sm hover:underline">
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}