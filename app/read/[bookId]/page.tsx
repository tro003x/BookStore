'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ReadBookPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const bookId = params.bookId as string;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchPdf = async () => {
      try {
        const res = await fetch(`/api/books/${bookId}/pdf?preview=false`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load book');
          setLoading(false);
          return;
        }

        // Get book metadata for title
        const bookRes = await fetch(`/api/books/${bookId}`);
        const bookData = await bookRes.json();
        setBookTitle(bookData.title || 'Book');

        setPdfUrl(data.url);
        setLoading(false);
      } catch (err) {
        setError('Failed to load book');
        setLoading(false);
      }
    };
    fetchPdf();
  }, [bookId, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC]">
        <p className="text-[#6B7280]">Loading book...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC]">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/reader')} variant="outline">
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1D1E] flex flex-col">
      {/* Top bar */}
      <header className="bg-[#1A1D1E] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Button
          onClick={() => router.push('/dashboard/reader')}
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Library
        </Button>
        <h1 className="font-['Fraunces'] text-white text-lg truncate max-w-md">
          {bookTitle}
        </h1>
        <div className="w-32" /> {/* Spacer */}
      </header>

      {/* PDF Iframe */}
      <div className="flex-1 bg-[#2A2824]">
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={bookTitle}
          />
        )}
      </div>
    </div>
  );
}