'use client';

import { Suspense } from 'react';
import ChatPanel from '@/components/dashboard/ChatPanel';

export default function PublisherMessagesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Fraunces'] text-2xl font-semibold text-[#0C0A00]">
          Messages
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Chat with admins and authors
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
          </div>
        }
      >
        <ChatPanel />
      </Suspense>
    </div>
  );
}