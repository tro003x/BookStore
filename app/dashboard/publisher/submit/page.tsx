'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
}

export default function PublisherSubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

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
      if (data.length > 0) setCategoryId(data[0].id);
    };
    fetchCategories();
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pdf) {
      alert('PDF file is required');
      return;
    }
    setLoading(true);
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
      alert('Book created! Pay $10 to submit for approval.');
      router.push('/dashboard/publisher/books');
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Something went wrong'));
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Submit New Book</h1>
      <Card className="max-w-2xl border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="font-['Fraunces'] text-xl">Book Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
                className="border-[#E5E7EB]"
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
                required
                className="border-[#E5E7EB]"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                className="border-[#E5E7EB]"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                required
                className="border-[#E5E7EB]"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId}
                onValueChange={(val) => {
                  if (val !== null) setCategoryId(val);
                }}
                required
              >
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pdf">PDF File</Label>
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPdf(e.target.files?.[0] || null)}
                required
                className="border-[#E5E7EB]"
              />
            </div>
            <div>
              <Label htmlFor="cover">Cover Image</Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCover(e.target.files?.[0] || null)}
                className="border-[#E5E7EB]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0C0A00] text-white hover:bg-[#0C0A00]/80"
            >
              {loading ? 'Creating Draft...' : 'Create Draft'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}