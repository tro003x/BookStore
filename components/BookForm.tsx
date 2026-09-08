'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
}

interface BookFormProps {
  initialData?: {
    id?: string;
    title: string;
    author: string;
    description?: string;
    price: number;
    categoryId: string;
    coverImageUrl?: string | null;
  };
  onSubmit: (data: any) => Promise<void>;
  submitLabel: string;
  categories: Category[];
}

export default function BookForm({ initialData, onSubmit, submitLabel, categories }: BookFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('categoryId', categoryId);
    if (pdf) formData.append('pdf', pdf);
    if (cover) formData.append('cover', cover);
    if (initialData?.id) formData.append('id', initialData.id);

    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border-[#E5E7EB]"
        />
      </div>
      <div>
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className="border-[#E5E7EB]"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border-[#E5E7EB]"
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
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
        <Label htmlFor="pdf">PDF File {!initialData?.id && '*'}</Label>
        <Input
          id="pdf"
          type="file"
          accept=".pdf"
          onChange={(e) => setPdf(e.target.files?.[0] || null)}
          required={!initialData?.id}
          className="border-[#E5E7EB]"
        />
      </div>
      <div>
        <Label htmlFor="cover">Cover Image</Label>
        <Input
          id="cover"
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files?.[0] || null)}
          className="border-[#E5E7EB]"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="bg-[#0C0A00] text-white hover:bg-[#0C0A00]/80 w-full"
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}