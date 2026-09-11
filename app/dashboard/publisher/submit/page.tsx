'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BookForm from '@/components/BookForm';
import { toast } from 'sonner';

export default function PublisherSubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'PUBLISHER') {
      router.push('/');
      return;
    }

    const fetchCategories = async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
  }, [status, session, router]);

  const handleSubmit = async (formData: FormData) => {
    const res = await fetch('/api/publisher/books', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      toast.success('Book created! Pay $10 to submit for approval.');
      router.push('/dashboard/publisher/books');
    } else {
      const err = await res.json();
      toast.error(err.error || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-2xl font-semibold mb-4">Submit New Book</h1>
      <Card className="border-[#E5E7EB] text-left">
        <CardHeader>
          <CardTitle className="font-['Fraunces'] text-xl text-center">
            Book Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookForm
            onSubmit={handleSubmit}
            submitLabel="Create Draft"
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}