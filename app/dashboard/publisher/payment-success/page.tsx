'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function PublisherPaymentSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const bookId = searchParams.get('bookId');
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('Missing payment session.');
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch('/api/publisher/payment-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setTimeout(() => router.push('/dashboard/publisher/books'), 1500);
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Could not confirm payment.');
        }
      } catch {
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
          Your book has been submitted for admin approval. Redirecting...
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
        onClick={() => router.push('/dashboard/publisher/books')}
        className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white py-2.5 rounded-lg font-medium transition-colors"
      >
        Back to My Books
      </button>
    </div>
  );
}

export default function PublisherPaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-[#6B7280]">Loading...</div>}>
        <PublisherPaymentSuccessInner />
      </Suspense>
    </div>
  );
}