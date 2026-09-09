'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCheck,
  Upload,
  Library,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

export default function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const getNavItems = (): NavItem[] => {
    const role = session?.user?.role;
    switch (role) {
    case 'ADMIN':
  return [
    { title: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { title: 'Manage Books', href: '/dashboard/admin/manage-books', icon: BookOpen },
    { title: 'Manage Authors', href: '/dashboard/admin/manage-authors', icon: UserCheck },
    { title: 'Manage Publishers', href: '/dashboard/admin/manage-publishers', icon: Users },
    { title: 'Pending Books', href: '/dashboard/admin/books', icon: BookOpen },
    { title: 'Pending Authors', href: '/dashboard/admin/pending-authors', icon: FileCheck },
    { title: 'Pending Publishers', href: '/dashboard/admin/pending-publishers', icon: FileCheck },
    
  ];
      case 'PUBLISHER':
        return [
          { title: 'Dashboard', href: '/dashboard/publisher', icon: LayoutDashboard },
          { title: 'My Books', href: '/dashboard/publisher/books', icon: BookOpen },
          { title: 'Submit Book', href: '/dashboard/publisher/submit', icon: Upload },
        ];
      case 'AUTHOR':
        return [
          { title: 'Dashboard', href: '/dashboard/author', icon: LayoutDashboard },
          { title: 'My Books', href: '/dashboard/author/books', icon: Library },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const user = session?.user;

  return (
    <aside
      className={cn(
        "h-full bg-[#0C0A00] text-[#F5F6F7] flex flex-col flex-shrink-0 border-r border-[#2A2824] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn("p-4 border-b border-[#2A2824] flex-shrink-0 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <>
            <h1 className="font-['Fraunces'] text-xl font-semibold text-white">BoiStore</h1>
            <p className="text-xs text-[#6B7280]">Dashboard</p>
          </>
        )}
        {collapsed && (
          <span className="text-white font-bold text-lg">BS</span>
        )}
      </div>

      {/* Body – scrollable nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-[#2DD4BF]/10 text-[#2DD4BF]"
                  : "text-[#F5F6F7] hover:bg-[#2DD4BF]/10 hover:text-[#2DD4BF]"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("p-4 border-t border-[#2A2824] flex-shrink-0", collapsed ? "flex flex-col items-center" : "")}>
        <div className={cn("flex items-center gap-3", collapsed ? "flex-col" : "")}>
          <div className="h-8 w-8 rounded-full bg-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF] font-bold text-sm">
            {user?.name?.[0] || 'U'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-[#6B7280] truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-md hover:bg-[#2DD4BF]/10 text-[#6B7280] hover:text-[#2DD4BF] transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-md hover:bg-[#2DD4BF]/10 text-[#6B7280] hover:text-[#2DD4BF] transition-colors mt-2"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}