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
import StatusBadge from '@/components/dashboard/StatusBadge';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Publisher {
  id: string;
  name: string;
  phone: string | null;
  verificationStatus: string;
  user: { email: string; name: string | null };
  nidUrl: string | null;
  selfieUrl: string | null;
}

export default function PendingPublishersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Publisher | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

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
      const res = await fetch('/api/admin/verification/pending');
      const data = await res.json();
      setPublishers(data.publishers || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDocs = (publisher: Publisher) => {
    setSelected(publisher);
    setDialogOpen(true);
  };

  const handleVerify = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessing(id);
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'publisher', status: action }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Publisher ${action.toLowerCase()}`);
      fetchData();
    } catch {
      toast.error('Action failed');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading pending publishers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Pending Publishers (Verification)</h1>

      <div className="bg-white rounded-md border border-[#E5E7EB] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[#6B7280]">
                  No pending publishers.
                </TableCell>
              </TableRow>
            ) : (
              publishers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.user.email}</TableCell>
                  <TableCell>{p.phone || '—'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDocs(p)}
                      className="border-[#E5E7EB] text-[#1A1D1E] hover:bg-[#F5F2EC]"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> View Docs
                    </Button>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="PENDING" />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleVerify(p.id, 'APPROVED')}
                      disabled={processing === p.id}
                      className="bg-[#16A34A] text-white hover:bg-[#16A34A]/80"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(p.id, 'REJECTED')}
                      disabled={processing === p.id}
                      className="border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10"
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Docs Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Fraunces'] text-xl">
              {selected?.name} — Documents
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
                  Representative's NID
                </p>
                {selected.nidUrl ? (
                  <a href={selected.nidUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selected.nidUrl}
                      alt="Representative's NID"
                      className="w-full h-52 object-cover rounded-lg border border-[#E5E7EB] hover:opacity-90 transition cursor-pointer"
                    />
                  </a>
                ) : (
                  <div className="w-full h-52 rounded-lg bg-[#F5F2EC] flex items-center justify-center text-xs text-[#6B7280]">
                    Not uploaded
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
                  License
                </p>
                {selected.selfieUrl ? (
                  <a href={selected.selfieUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selected.selfieUrl}
                      alt="License"
                      className="w-full h-52 object-cover rounded-lg border border-[#E5E7EB] hover:opacity-90 transition cursor-pointer"
                    />
                  </a>
                ) : (
                  <div className="w-full h-52 rounded-lg bg-[#F5F2EC] flex items-center justify-center text-xs text-[#6B7280]">
                    Not uploaded
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}