'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ReadBookPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const bookId = params.bookId as string;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('Book');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/books/${bookId}/pdf?preview=false`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load book');
          setLoading(false);
          return;
        }

        setPdfUrl(data.url);
        if (data.title) setBookTitle(data.title);
      } catch (err) {
        console.error('PDF fetch error:', err);
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookId, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] px-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#DC2626]/10 mb-4">
            <AlertCircle className="h-6 w-6 text-[#DC2626]" />
          </div>
          <h1 className="font-['Fraunces'] text-xl font-semibold mb-2">
            Failed to load book
          </h1>
          <p className="text-sm text-[#6B7280] mb-6">{error}</p>
          <Button
            onClick={() => router.push('/dashboard/reader')}
            className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white"
          >
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1A1D1E] flex flex-col">
      {/* Top bar */}
      <header className="bg-[#1A1D1E] border-b border-white/10 px-4 py-3 flex items-center justify-between flex-shrink-0">
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
        <div className="w-32" />
      </header>

      {/* PDF viewer */}
      <div className="flex-1 bg-[#2A2824]">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={bookTitle}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-white/60 text-sm">
            No PDF available.
          </div>
        )}
      </div>
    </div>
  );
}