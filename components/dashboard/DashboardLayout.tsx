'use client';

import { ReactNode, useState } from 'react';
import AppSidebar from './AppSidebar';
import DashboardTopBar from './DashboardTopBar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F6F7]">
      <AppSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}