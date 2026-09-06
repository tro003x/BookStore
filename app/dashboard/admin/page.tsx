'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Publisher {
  id: string;
  name: string;
  approved: boolean;
  user: { email: string; name: string };
}

interface Book {
  id: string;
  title: string;
  author: string;
  status: string;
  category: { name: string };
  publisher: { name: string };
}

interface VerificationItem {
  id: string;
  name: string;
  user: { email: string; name: string };
  nidUrl?: string;
  selfieUrl?: string;
  verificationStatus: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [verificationData, setVerificationData] = useState<{
    authors: VerificationItem[];
    publishers: VerificationItem[];
  }>({ authors: [], publishers: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'publishers' | 'books' | 'verification'>('publishers');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    email: string;
    type: 'author' | 'publisher';
    nidUrl?: string;
    selfieUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
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
      setLoading(true);
      const [pubsRes, booksRes, verRes] = await Promise.all([
        fetch('/api/admin/publishers'),
        fetch('/api/admin/books'),
        fetch('/api/admin/verification/pending'),
      ]);
      const pubs = await pubsRes.json();
      const bks = await booksRes.json();
      const ver = await verRes.json();
      setPublishers(pubs);
      setBooks(bks);
      setVerificationData(ver);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const approvePublisher = async (id: string) => {
  await fetch(`/api/admin/publishers/${id}/approve`, { method: 'POST' });
  // Refresh only publishers
  const pubsRes = await fetch('/api/admin/publishers');
  const pubs = await pubsRes.json();
  setPublishers(pubs);
};

 const approveBook = async (id: string) => {
  await fetch(`/api/admin/books/${id}/approve`, { method: 'POST' });
  // Refresh only books
  const booksRes = await fetch('/api/admin/books');
  const bks = await booksRes.json();
  setBooks(bks);
};

 const handleVerify = async (id: string, type: 'author' | 'publisher', status: 'APPROVED' | 'REJECTED') => {
  await fetch(`/api/admin/verification/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, status }),
  });
  setDialogOpen(false);

  // Refresh only verification data
  const verRes = await fetch('/api/admin/verification/pending');
  const ver = await verRes.json();
  setVerificationData(ver);
};

  const openDialog = (item: VerificationItem, type: 'author' | 'publisher') => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      email: item.user.email,
      type,
      nidUrl: item.nidUrl,
      selfieUrl: item.selfieUrl,
    });
    setDialogOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Loading admin dashboard...</div>;

  const pendingPublishers = publishers.filter(p => !p.approved);
  const pendingBooks = books.filter(b => b.status === 'PENDING');
  const pendingAuthors = verificationData.authors.filter(a => a.verificationStatus === 'PENDING');
  const pendingPubs = verificationData.publishers.filter(p => p.verificationStatus === 'PENDING');
  const totalPending = pendingAuthors.length + pendingPubs.length;

  return (
    <div className="min-h-screen bg-[#EFE9DC] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-['Fraunces'] text-3xl font-semibold mb-6">Admin Dashboard</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setTab('publishers')}
            className={`px-4 py-2 rounded ${tab === 'publishers' ? 'bg-[#4B5D45] text-white' : 'bg-[#C9BFA8]'}`}
          >
            Publishers ({pendingPublishers.length} pending)
          </button>
          <button
            onClick={() => setTab('books')}
            className={`px-4 py-2 rounded ${tab === 'books' ? 'bg-[#4B5D45] text-white' : 'bg-[#C9BFA8]'}`}
          >
            Books ({pendingBooks.length} pending)
          </button>
          <button
            onClick={() => setTab('verification')}
            className={`px-4 py-2 rounded ${tab === 'verification' ? 'bg-[#4B5D45] text-white' : 'bg-[#C9BFA8]'}`}
          >
            Verification ({totalPending} pending)
          </button>
          <Link
            href="/dashboard/admin/reports"
            className="px-4 py-2 rounded bg-[#A85C32] text-white hover:opacity-90"
          >
            Reports
          </Link>
        </div>

        {tab === 'publishers' && (
          <div className="space-y-3">
            {pendingPublishers.length === 0 ? (
              <p className="text-gray-600">All publishers approved.</p>
            ) : (
              pendingPublishers.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-600">{p.user.email}</p>
                  </div>
                  <button
                    onClick={() => approvePublisher(p.id)}
                    className="bg-[#4B5D45] text-white px-4 py-1 rounded hover:opacity-90"
                  >
                    Approve
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'books' && (
          <div className="space-y-3">
            {pendingBooks.length === 0 ? (
              <p className="text-gray-600">All books approved.</p>
            ) : (
              pendingBooks.map((b) => (
                <div key={b.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{b.title}</p>
                    <p className="text-sm text-gray-600">by {b.author}</p>
                    <p className="text-sm text-gray-500">{b.category.name} • {b.publisher.name}</p>
                  </div>
                  <button
                    onClick={() => approveBook(b.id)}
                    className="bg-[#4B5D45] text-white px-4 py-1 rounded hover:opacity-90"
                  >
                    Approve
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'verification' && (
          <div className="space-y-6">
            {/* Pending Authors */}
            <div>
              <h2 className="font-['Fraunces'] text-xl font-semibold mb-3">Pending Authors ({pendingAuthors.length})</h2>
              {pendingAuthors.length === 0 ? (
                <p className="text-gray-600">No pending authors.</p>
              ) : (
                pendingAuthors.map((author) => (
                  <div key={author.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{author.name}</p>
                      <p className="text-sm text-gray-600">{author.user.email}</p>
                    </div>
                    <Button
                      onClick={() => openDialog(author, 'author')}
                      className="bg-[#4B5D45] text-white hover:opacity-90"
                    >
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Pending Publishers */}
            <div>
              <h2 className="font-['Fraunces'] text-xl font-semibold mb-3">Pending Publishers ({pendingPubs.length})</h2>
              {pendingPubs.length === 0 ? (
                <p className="text-gray-600">No pending publishers.</p>
              ) : (
                pendingPubs.map((pub) => (
                  <div key={pub.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{pub.name}</p>
                      <p className="text-sm text-gray-600">{pub.user.email}</p>
                    </div>
                    <Button
                      onClick={() => openDialog(pub, 'publisher')}
                      className="bg-[#4B5D45] text-white hover:opacity-90"
                    >
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Fraunces'] text-xl">Verify {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">Email: {selectedItem?.email}</p>
            <div className="flex gap-4 justify-center">
              {selectedItem?.nidUrl && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">NID</p>
                  <img
                    src={selectedItem.nidUrl}
                    alt="NID"
                    className="h-48 w-auto object-cover border rounded-lg shadow"
                  />
                </div>
              )}
              {selectedItem?.selfieUrl && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Selfie</p>
                  <img
                    src={selectedItem.selfieUrl}
                    alt="Selfie"
                    className="h-48 w-auto object-cover border rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => handleVerify(selectedItem!.id, selectedItem!.type, 'REJECTED')}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleVerify(selectedItem!.id, selectedItem!.type, 'APPROVED')}
              className="bg-green-600 text-white hover:opacity-90"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}