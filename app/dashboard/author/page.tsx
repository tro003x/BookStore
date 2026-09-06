'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  price: number;
  status: string;
  _count?: { purchaseItems: number };
}

export default function AuthorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'AUTHOR') {
      router.push('/');
      return;
    }

    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/author/books');
        const data = await res.json();
        setBooks(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [status, session, router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#EFE9DC] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-['Fraunces'] text-3xl font-semibold mb-6">Author Dashboard</h1>

        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="font-['Fraunces'] text-xl font-semibold mb-2">Welcome, {session?.user?.name}</h2>
          <p className="text-sm text-[#1A1D1E]/60">Manage your books and track sales.</p>
        </div>

        <h2 className="font-['Fraunces'] text-xl font-semibold mb-4">Your Books</h2>
        {books.length === 0 ? (
          <p>No books found.</p>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <div key={book.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className="text-sm text-gray-600">${Number(book.price).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Copies sold: {book._count?.purchaseItems || 0}</p>
                  <p className={`text-sm font-medium ${book.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {book.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}