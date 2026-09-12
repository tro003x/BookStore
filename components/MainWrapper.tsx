'use client';

import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard =
  pathname?.startsWith('/dashboard') || pathname?.startsWith('/read');

  return (
    <main className={`flex-1 ${isDashboard ? '' : 'pt-24'}`}>
      {children}
    </main>
  );
}