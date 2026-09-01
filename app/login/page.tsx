'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes('verify')) {
        setError('Please verify your email first. Check your inbox.');
      } else {
        setError('Invalid email or password');
      }
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE9DC] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="font-['Fraunces'] text-2xl font-semibold text-center mb-2">Sign In</h1>
        <p className="text-center text-[#1A1D1E]/60 text-sm mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]/80">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 border border-[#C9BFA8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B5D45]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="mt-1 w-full px-4 py-2 border border-[#C9BFA8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B5D45]"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#4B5D45] text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            Sign In
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#C9BFA8]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-[#1A1D1E]/60">Or continue with</span>
          </div>
        </div>

       <button
  onClick={() => signIn('google', { callbackUrl: '/' })}
  className="w-full border border-[#C9BFA8] py-2 rounded-lg hover:bg-[#EFE9DC] transition flex items-center justify-center gap-2"
>
  <span>Continue with Google</span>
</button>

        <p className="text-center text-sm mt-6 text-[#1A1D1E]/60">
          Don`t have an account?{' '}
          <Link href="/signup" className="text-[#4B5D45] hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}