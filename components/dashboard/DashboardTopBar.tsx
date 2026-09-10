'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Mail, Phone, PanelLeft, Home } from 'lucide-react';

export default function DashboardTopBar({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const crumbs = pathname.split('/').filter(Boolean);
  const pageTitle = crumbs.length > 1 ? crumbs[crumbs.length - 1] : 'Dashboard';

  const user = session?.user;
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const userRole = user?.role || '';

  return (
    <>
      <header className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-[#6B7280] hover:text-[#0C0A00]"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-[#0C0A00] capitalize">
            {pageTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Back to Store */}
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="border-[#E5E7EB] text-[#0C0A00] hover:bg-[#F5F2EC] flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">Back to Store</span>
          </Button>

          {/* Avatar */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#F5F6F7] transition-colors cursor-pointer"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#0C0A00] text-white">
                {userName[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-['Fraunces'] text-xl">Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-[#0C0A00] text-white text-lg">
                  {userName[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-[#0C0A00]">{userName}</p>
                <p className="text-sm text-[#6B7280]">{userRole}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#6B7280]" />
                <span>{userEmail}</span>
              </div>
              {userRole === 'PUBLISHER' || userRole === 'AUTHOR' ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#6B7280]" />
                  <span>Not provided</span>
                </div>
              ) : null}
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 rounded-md py-2 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}