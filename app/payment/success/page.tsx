'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="font-['Fraunces'] text-2xl font-semibold mb-4">Payment Successful!</h1>
      <p>Your book is now in your library.</p>
      <Link href="/dashboard/reader" className="text-[#4B5D45] hover:underline">
        Go to My Library
      </Link>
    </div>
  );
}