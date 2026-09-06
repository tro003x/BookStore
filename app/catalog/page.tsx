'use client';

import { useEffect, useState } from 'react';
import BookCard from '@/components/BookCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  authorName: string;
  price: number;
  coverImageUrl: string | null;
  category: { name: string };
}

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      const url = debouncedSearch
        ? `/api/books?q=${encodeURIComponent(debouncedSearch)}`
        : '/api/books';
      const res = await fetch(url);
      const data = await res.json();
      setBooks(data);
      setLoading(false);
    };
    fetchBooks();
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-[#EFE9DC] px-4 py-8">
      <div className="container mx-auto">
        <h1 className="font-['Fraunces'] text-3xl font-semibold mb-6 text-[#1A1D1E]">Catalog</h1>

        <div className="flex gap-2 mb-6 max-w-md">
          <Input
            placeholder="Search by title, author, or publisher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border-[#C9BFA8]"
          />
          <Button variant="outline" className="border-[#4B5D45] text-[#4B5D45]">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : books.length === 0 ? (
          <p className="text-[#1A1D1E]/60">No books found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}