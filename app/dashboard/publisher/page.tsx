'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  status: string;
  category: { name: string };
  createdAt: string;
}

export default function PublisherDashboard() {
  const { data: session, status } = useSession();
  console.log('Session role:', session?.user?.role);
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'PUBLISHER') {
      router.push('/');
      return;
    }

    const fetchBooks = async () => {
      const res = await fetch('/api/publisher/books');
      const data = await res.json();
      setBooks(data);
      setLoading(false);
    };

    const fetchCategories = async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) setCategoryId(data[0].id);
    };

    fetchBooks();
    fetchCategories();
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdf) {
      alert('PDF file is required');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('categoryId', categoryId);
    formData.append('pdf', pdf);
    if (cover) formData.append('cover', cover);

    const res = await fetch('/api/publisher/books', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Book submitted for approval!');
      setShowForm(false);
      setTitle('');
      setAuthor('');
      setDescription('');
      setPrice('');
      setPdf(null);
      setCover(null);
      // Refresh books
      const fetchBooks = async () => {
        const res = await fetch('/api/publisher/books');
        const data = await res.json();
        setBooks(data);
      };
      fetchBooks();
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Something went wrong'));
    }
    setUploading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600';
      case 'PENDING': return 'text-yellow-600';
      case 'REJECTED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#EFE9DC] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-['Fraunces'] text-3xl font-semibold">Publisher Dashboard</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#4B5D45] text-white px-4 py-2 rounded hover:opacity-90"
          >
            {showForm ? 'Cancel' : '+ New Book'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="w-full border p-2 rounded"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
              rows={3}
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
              className="w-full border p-2 rounded"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full border p-2 rounded"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div>
              <label className="block text-sm font-medium">PDF File *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdf(e.target.files?.[0] || null)}
                required
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCover(e.target.files?.[0] || null)}
                className="w-full border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-[#4B5D45] text-white px-6 py-2 rounded hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Submit for Approval'}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {books.length === 0 ? (
            <p>No books uploaded yet.</p>
          ) : (
            books.map((book) => (
              <div key={book.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                  <p className="text-sm text-gray-500">${Number(book.price).toFixed(2)} • {book.category.name}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getStatusColor(book.status)}`}>{book.status}</p>
                  <p className="text-xs text-gray-400">{new Date(book.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}