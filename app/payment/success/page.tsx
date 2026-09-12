'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('No session ID found.');
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

        if (res.ok && data.success) {
          setStatus('success');
          setTimeout(() => router.push('/dashboard/reader'), 1500);
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Could not confirm payment.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg('Something went wrong.');
      }
    };
    confirm();
  }, [sessionId, router]);

  if (status === 'processing') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
        </div>
        <h1 className="font-['Fraunces'] text-xl font-semibold mb-2">
          Confirming your payment...
        </h1>
        <p className="text-sm text-[#6B7280]">Please wait a moment.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#16A34A]/10 mb-5">
          <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
        </div>
        <h1 className="font-['Fraunces'] text-2xl font-semibold mb-2">
          Payment successful!
        </h1>
        <p className="text-sm text-[#6B7280]">
          Redirecting you to your library...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#DC2626]/10 mb-5">
        <AlertCircle className="h-8 w-8 text-[#DC2626]" />
      </div>
      <h1 className="font-['Fraunces'] text-2xl font-semibold mb-2">
        Payment confirmation failed
      </h1>
      <p className="text-sm text-[#6B7280] mb-6">{errorMsg}</p>
      <button
        onClick={() => router.push('/cart')}
        className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white py-2.5 rounded-lg font-medium transition-colors"
      >
        Back to Cart
      </button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-[#6B7280]">Loading...</div>}>
        <PaymentSuccessInner />
      </Suspense>
    </div>
  );
}