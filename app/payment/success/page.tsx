'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).then(() => {
        router.push('/dashboard/reader');
      });
    }
  }, [sessionId, router]);

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="font-['Fraunces'] text-2xl font-semibold mb-4">Payment Successful!</h1>
      <p>Redirecting to your library...</p>
    </div>
  );
}