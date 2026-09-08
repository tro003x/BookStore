'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import StatusBadge from '@/components/dashboard/StatusBadge';
import BookForm from '@/components/BookForm';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  status: string;
  category: { name: string };
  publisher: { name: string };
  coverImageUrl: string | null;
  pdfStoragePath: string | null;
}

export default function ManageBooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

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
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [booksRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/books/manage'),
        fetch('/api/categories'),
      ]);
      const booksData = await booksRes.json();
      const categoriesData = await categoriesRes.json();
      setBooks(booksData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setDialogOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setDialogOpen(true);
  };

  const handleDeleteBook = (id: string) => {
    setBookToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    const isEdit = !!editingBook;
    const url = isEdit ? `/api/admin/books/${editingBook.id}` : '/api/admin/books';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (res.ok) {
      setDialogOpen(false);
      fetchData();
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Something went wrong'));
    }
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    const res = await fetch(`/api/admin/books/${bookToDelete}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setDeleteDialogOpen(false);
      fetchData();
    } else {
      alert('Failed to delete book');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Books</h1>
        <Button onClick={handleAddBook} className="bg-[#2DD4BF] text-white hover:bg-[#2DD4BF]/80">
          <Plus className="h-4 w-4 mr-2" /> Add Book
        </Button>
      </div>

      <div className="bg-white rounded-md border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Publisher</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell>{b.author}</TableCell>
                <TableCell>{b.category.name}</TableCell>
                <TableCell>{b.publisher.name}</TableCell>
                <TableCell>${Number(b.price).toFixed(2)}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditBook(b)}
                    className="h-8 w-8 text-[#6B7280] hover:text-[#0C0A00]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBook(b.id)}
                    className="h-8 w-8 text-[#6B7280] hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Fraunces'] text-xl">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </DialogTitle>
          </DialogHeader>
          <BookForm
            initialData={editingBook ? { ...editingBook, price: Number(editingBook.price), categoryId: editingBook.categoryId } : undefined}
            onSubmit={handleSubmit}
            submitLabel={editingBook ? 'Update Book' : 'Create Book'}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}