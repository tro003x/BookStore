'use client';

import { ReactNode } from 'react';

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardShell({ children, title, subtitle }: DashboardShellProps) {
  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0C0A00]">{title}</h1>
        {subtitle && <p className="text-sm text-[#6B7280]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}