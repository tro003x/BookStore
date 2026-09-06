'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const bookId = searchParams.get('bookId');

  useEffect(() => {
    if (sessionId && bookId) {
      fetch('/api/publisher/payment-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).then(() => {
        router.push('/dashboard/publisher');
      });
    }
  }, [sessionId, bookId, router]);

  return <div className="p-8 text-center">Processing payment...</div>;
}