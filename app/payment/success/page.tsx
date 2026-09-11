// app/payment/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('Processing payment...');

  useEffect(() => {
    if (!sessionId) {
      setStatus('No session found.');
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        console.log('SUCCESS PAGE: confirm response =', data);

        if (res.ok && data.success) {
          setStatus('Payment successful! Redirecting to your library...');
          setTimeout(() => router.push('/dashboard/reader'), 1000);
        } else {
          setStatus(data.error || 'Confirmation failed');
        }
      } catch (err) {
        console.error('SUCCESS PAGE error:', err);
        setStatus('Something went wrong.');
      }
    };

    confirm();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC]">
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center max-w-md">
        <p className="text-[#1A1D1E]">{status}</p>
      </div>
    </div>
  );
}