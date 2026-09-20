'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import StatusBadge from '@/components/dashboard/StatusBadge';
import BookForm from '@/components/BookForm';
import VerificationGate from '@/components/dashboard/VerificationGate';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  status: string;
  paymentStatus: string;
  category: { name: string };
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

export default function PublisherBooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [payingBookId, setPayingBookId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'PUBLISHER') {
      router.push('/');
      return;
    }
    if (session?.user?.verificationStatus !== 'APPROVED') return;
    fetchData();
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [booksRes, categoriesRes] = await Promise.all([
        fetch('/api/publisher/books'),
        fetch('/api/categories'),
      ]);
      if (!booksRes.ok) throw new Error('Failed to fetch books');
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
      const booksData = await booksRes.json();
      const categoriesData = await categoriesRes.json();
      const mappedBooks = booksData.map((book: any) => ({
        ...book,
        author: book.authorName,
        categoryId: book.categoryId,
      }));
      setBooks(mappedBooks);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBookToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    if (!editingBook) return;
    try {
      const res = await fetch(`/api/publisher/books/${editingBook.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }
      toast.success('Book updated');
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      const res = await fetch(`/api/publisher/books/${bookToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Book deleted');
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handlePay = async (bookId: string) => {
    try {
      setPayingBookId(bookId);
      const res = await fetch(`/api/publisher/books/${bookId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start payment');
        setPayingBookId(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment error');
      setPayingBookId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading books...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.verificationStatus !== 'APPROVED') {
    return (
      <VerificationGate
        role="publisher"
        status={session?.user?.verificationStatus}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Books</h1>

      <div className="bg-white rounded-md border border-[#E5E7EB] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-[#6B7280]">
                  No books uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              books.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.author}</TableCell>
                  <TableCell>${Number(b.price).toFixed(2)}</TableCell>
                  <TableCell>{b.category.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell>
                    {b.status === 'DRAFT' && b.paymentStatus === 'UNPAID' ? (
                      <Button
                        size="sm"
                        onClick={() => handlePay(b.id)}
                        disabled={payingBookId === b.id}
                        className="bg-[#A85C32] text-white hover:bg-[#A85C32]/80 disabled:opacity-50"
                      >
                        {payingBookId === b.id ? (
                          <span className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            Paying...
                          </span>
                        ) : (
                          'Pay $10'
                        )}
                      </Button>
                    ) : b.paymentStatus === 'PAID' ? (
                      <span className="text-xs text-[#16A34A]">Paid</span>
                    ) : (
                      <span className="text-xs text-[#6B7280]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(b)}
                      className="h-8 w-8 text-[#6B7280] hover:text-[#0C0A00]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(b.id)}
                      className="h-8 w-8 text-[#6B7280] hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Fraunces'] text-xl">
              Edit Book
            </DialogTitle>
          </DialogHeader>
          <BookForm
            initialData={
              editingBook
                ? {
                    ...editingBook,
                    price: Number(editingBook.price),
                    categoryId: editingBook.categoryId,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            submitLabel="Update Book"
            categories={categories}
          />
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}