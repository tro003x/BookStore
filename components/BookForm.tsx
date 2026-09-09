'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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
  onSubmit: (data: FormData) => Promise<void>;
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
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
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
            placeholder="Enter author name"
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
            placeholder="Enter book description"
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
            placeholder="Enter price"
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
          {/* Optional: show selected name below for clarity */}
          {categories.find(c => c.id === categoryId) && (
            <p className="text-xs text-[#6B7280] mt-1">
              Selected: {categories.find(c => c.id === categoryId)?.name}
            </p>
          )}
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
          <p className="text-xs text-[#6B7280] mt-1">Upload a PDF file</p>
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
          <p className="text-xs text-[#6B7280] mt-1">Upload a cover image</p>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0C0A00] text-white hover:bg-[#0C0A00]/90 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </div>
  );
}