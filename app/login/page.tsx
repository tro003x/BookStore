'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotVerified(false);

    // Pre-check: is email verified?
    try {
      const checkRes = await fetch(
        `/api/auth/check-email-status?email=${encodeURIComponent(email)}`
      );
      const checkData = await checkRes.json();

      if (checkData.exists && !checkData.verified) {
        setNotVerified(true);
        setLoading(false);
        return;
      }
    } catch {
      // If check fails, fall through to normal login attempt
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Invalid email or password');
      setLoading(false);
    } else {
      toast.success('Signed in successfully');
      router.push('/');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Verification email sent. Check your inbox.');
      } else {
        toast.error(data.error || 'Failed to resend');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 w-full max-w-md">
        <h1 className="font-['Fraunces'] text-2xl font-semibold text-center mb-2">
          Sign In
        </h1>
        <p className="text-center text-[#6B7280] text-sm mb-6">
          Sign in to your account
        </p>

        {/* Not verified banner */}
        {notVerified && (
          <div className="mb-5 p-4 rounded-lg bg-[#FEF3C7] border border-[#FCD34D] flex gap-3">
            <AlertCircle className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#92400E]">
                Email not verified
              </p>
              <p className="text-xs text-[#92400E]/80 mt-0.5">
                Please check your inbox and click the verification link.
              </p>
              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-2 text-xs font-medium text-[#92400E] hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          </div>
        )}

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

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#1A1D1E]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#14B8A6] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2 pr-10 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1D1E] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-[#6B7280]">Or continue with</span>
          </div>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full border border-[#E5E7EB] py-2.5 rounded-lg hover:bg-[#F5F2EC] transition-colors flex items-center justify-center gap-2 text-sm font-medium text-[#1A1D1E]"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm mt-6 text-[#6B7280]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#14B8A6] hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}