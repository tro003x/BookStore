import { prisma } from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { revalidatePath } from 'next/cache';

interface PendingItem {
  id: string;
  name: string;
  user: { name: string | null; email: string };
  type: 'author' | 'publisher';
}

export default async function AdminVerificationPage() {
  const authors = await prisma.author.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: { select: { email: true, name: true } } },
  });

  const publishers = await prisma.publisher.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: { select: { email: true, name: true } } },
  });

  async function verify(id: string, type: 'author' | 'publisher', status: 'APPROVED' | 'REJECTED') {
    'use server';
    if (type === 'author') {
      await prisma.author.update({ where: { id }, data: { verificationStatus: status } });
    } else {
      await prisma.publisher.update({ where: { id }, data: { verificationStatus: status } });
    }
    revalidatePath('/dashboard/admin/verification');
  }

  const allPending: PendingItem[] = [
    ...authors.map(a => ({ ...a, type: 'author' as const })),
    ...publishers.map(p => ({ ...p, type: 'publisher' as const })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Pending Verification</h1>
      <div className="bg-white rounded-md border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPending.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.user.email}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell><StatusBadge status="PENDING" /></TableCell>
                <TableCell className="text-right space-x-2">
                  <form action={verify.bind(null, item.id, item.type, 'APPROVED')} className="inline">
                    <Button size="sm" className="bg-[#16A34A] text-white hover:bg-[#16A34A]/80">
                      Approve
                    </Button>
                  </form>
                  <form action={verify.bind(null, item.id, item.type, 'REJECTED')} className="inline">
                    <Button size="sm" variant="outline" className="border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10">
                      Reject
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}