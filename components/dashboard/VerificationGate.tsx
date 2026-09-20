'use client';

import Link from 'next/link';
import { Clock, MessageSquare } from 'lucide-react';

export default function VerificationGate({
  role,
  status,
}: {
  role: 'author' | 'publisher';
  status: string | null | undefined;
}) {
  const isRejected = status === 'REJECTED';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-[#E5E7EB] p-8 text-center">
        <div
          className={`inline-flex items-center justify-center h-14 w-14 rounded-full mb-4 ${
            isRejected ? 'bg-[#DC2626]/10' : 'bg-[#F59E0B]/10'
          }`}
        >
          <Clock
            className={`h-6 w-6 ${
              isRejected ? 'text-[#DC2626]' : 'text-[#F59E0B]'
            }`}
          />
        </div>

        <h1 className="font-['Fraunces'] text-xl font-semibold mb-2">
          {isRejected ? 'Verification Rejected' : 'Verification Pending'}
        </h1>

        <p className="text-sm text-[#6B7280] mb-6">
          {isRejected
            ? 'Your verification was rejected by an administrator. Please contact support for more information.'
            : `Your ${role} account is awaiting admin approval. You will get access to your dashboard once your documents are verified.`}
        </p>

        <Link
          href={`/dashboard/${role}/messages`}
          className="inline-flex items-center gap-2 bg-[#4B5D45] hover:bg-[#3E4C39] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Message Admin
        </Link>
      </div>
    </div>
  );
}