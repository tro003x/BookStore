'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('READER');
  const [nid, setNid] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create user
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // 2. Upload NID and Selfie if role is AUTHOR or PUBLISHER
      if (role === 'AUTHOR' || role === 'PUBLISHER') {
        const userId = data.userId;

        const uploadForm = new FormData();
        uploadForm.append('userId', userId);
        if (nid) uploadForm.append('nid', nid);
        if (selfie) uploadForm.append('selfie', selfie);

        await fetch('/api/auth/upload-verification', {
          method: 'POST',
          body: uploadForm,
        });
      }

      router.push('/login');
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE9DC] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="font-['Fraunces'] text-2xl font-semibold text-center mb-2">Create Account</h1>
        <p className="text-center text-[#1A1D1E]/60 text-sm mb-6">Enter your information</p>

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
              placeholder="john@example.com"
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

          <div>
            <label className="block text-sm font-medium text-[#1A1D1E]/80">I want to join as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-[#C9BFA8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B5D45]"
            >
              <option value="READER">Reader</option>
              <option value="AUTHOR">Author</option>
              <option value="PUBLISHER">Publisher</option>
            </select>
          </div>

          {(role === 'AUTHOR' || role === 'PUBLISHER') && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1A1D1E]/80">NID Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNid(e.target.files?.[0] || null)}
                  className="mt-1 w-full px-4 py-2 border border-[#C9BFA8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B5D45] text-[#1A1D1E]/60 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#4B5D45] file:text-white file:text-sm hover:file:opacity-90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1D1E]/80">Selfie Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfie(e.target.files?.[0] || null)}
                  className="mt-1 w-full px-4 py-2 border border-[#C9BFA8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B5D45] text-[#1A1D1E]/60 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#4B5D45] file:text-white file:text-sm hover:file:opacity-90"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4B5D45] text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
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