'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#EFE9DC] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <h2 className="font-['Fraunces'] text-2xl font-semibold mb-2">Check your email</h2>
          <p className="text-[#1A1D1E]/60">
            We sent a verification link to <strong>{email}</strong>. Click it to verify your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE9DC] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="font-['Fraunces'] text-2xl font-semibold text-center mb-2">Create Account</h1>
        <p className="text-center text-[#1A1D1E]/60 text-sm mb-6">Enter your information to create a new account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]/80">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="mt-1 w-full px-4 py-2 border border-[#C9BFA8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B5D45]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john.doe@example.com"
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
            Create Account
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-[#1A1D1E]/60">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4B5D45] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}