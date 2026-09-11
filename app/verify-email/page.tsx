'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Verification failed');
        }
      } catch {
        setStatus('error');
        setErrorMsg('Something went wrong');
      }
    };
    verify();
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
        </div>
        <h1 className="font-['Fraunces'] text-xl font-semibold mb-2">
          Verifying your email...
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
          Email verified!
        </h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Your account is now active. You can log in with your credentials.
        </p>
        <Link href="/login">
          <button className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white py-2.5 rounded-lg font-medium transition-colors">
            Continue to Sign In
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#DC2626]/10 mb-5">
        <AlertCircle className="h-8 w-8 text-[#DC2626]" />
      </div>
      <h1 className="font-['Fraunces'] text-2xl font-semibold mb-2">
        Verification failed
      </h1>
      <p className="text-sm text-[#6B7280] mb-6">{errorMsg}</p>
      <div className="space-y-2">
        <Link href="/login">
          <button className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white py-2.5 rounded-lg font-medium transition-colors">
            <Mail className="h-4 w-4 inline mr-2" />
            Go to Sign In (Resend option)
          </button>
        </Link>
        <Link href="/signup">
          <button className="w-full border border-[#E5E7EB] hover:bg-[#F5F2EC] text-[#1A1D1E] py-2.5 rounded-lg font-medium transition-colors">
            Create a new account
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-[#6B7280]">Loading...</div>}>
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}