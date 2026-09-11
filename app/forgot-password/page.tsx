'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        toast.success('Reset link sent to your email');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Something went wrong');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#14B8A6]/10 mb-4">
            <Mail className="h-6 w-6 text-[#14B8A6]" />
          </div>
          <h1 className="font-['Fraunces'] text-2xl font-semibold mb-2">
            Check your email
          </h1>
          <p className="text-sm text-[#6B7280] mb-6">
            We sent a password reset link to <strong>{email}</strong>. It
            expires in 1 hour.
          </p>
          <Link href="/login">
            <button className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white py-2.5 rounded-lg font-medium transition-colors">
              Back to Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#1A1D1E] mb-4 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Sign In
        </Link>

        <h1 className="font-['Fraunces'] text-2xl font-semibold mb-2">
          Forgot Password?
        </h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}