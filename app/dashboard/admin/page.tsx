'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Publisher {
  id: string;
  name: string;
  approved: boolean;
  user: { email: string; name: string };
}

interface Book {
  id: string;
  title: string;
  author: string;
  status: string;
  category: { name: string };
  publisher: { name: string };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'publishers' | 'books'>('publishers');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchData();
  }, [status, session]);

  const fetchData = async () => {
    setLoading(true);
    const [pubsRes, booksRes] = await Promise.all([
      fetch('/api/admin/publishers'),
      fetch('/api/admin/books'),
    ]);
    const pubs = await pubsRes.json();
    const bks = await booksRes.json();
    setPublishers(pubs);
    setBooks(bks);
    setLoading(false);
  };

  const approvePublisher = async (id: string) => {
    await fetch(`/api/admin/publishers/${id}/approve`, { method: 'POST' });
    fetchData();
  };

  const approveBook = async (id: string) => {
    await fetch(`/api/admin/books/${id}/approve`, { method: 'POST' });
    fetchData();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#EFE9DC] p-6">
      <h1 className="font-['Fraunces'] text-3xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('publishers')}
          className={`px-4 py-2 rounded ${tab === 'publishers' ? 'bg-[#4B5D45] text-white' : 'bg-[#C9BFA8]'}`}
        >
          Publishers ({publishers.filter(p => !p.approved).length} pending)
        </button>
        <button
          onClick={() => setTab('books')}
          className={`px-4 py-2 rounded ${tab === 'books' ? 'bg-[#4B5D45] text-white' : 'bg-[#C9BFA8]'}`}
        >
          Books ({books.filter(b => b.status === 'PENDING').length} pending)
        </button>
      </div>

      {tab === 'publishers' && (
        <div className="space-y-3">
          {publishers.filter(p => !p.approved).length === 0 ? (
            <p>All publishers approved.</p>
          ) : (
            publishers.filter(p => !p.approved).map((p) => (
              <div key={p.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.user.email}</p>
                </div>
                <button
                  onClick={() => approvePublisher(p.id)}
                  className="bg-[#4B5D45] text-white px-4 py-1 rounded hover:opacity-90"
                >
                  Approve
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'books' && (
        <div className="space-y-3">
          {books.filter(b => b.status === 'PENDING').length === 0 ? (
            <p>All books approved.</p>
          ) : (
            books.filter(b => b.status === 'PENDING').map((b) => (
              <div key={b.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-gray-600">by {b.author}</p>
                  <p className="text-sm text-gray-500">{b.category.name} • {b.publisher.name}</p>
                </div>
                <button
                  onClick={() => approveBook(b.id)}
                  className="bg-[#4B5D45] text-white px-4 py-1 rounded hover:opacity-90"
                >
                  Approve
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}