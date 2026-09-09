import { prisma } from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { revalidatePath } from 'next/cache';

export default async function PendingPublishersPage() {
  const publishers = await prisma.publisher.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: { select: { email: true, name: true } } },
  });

  async function handleVerify(id: string, status: 'APPROVED' | 'REJECTED') {
    'use server';
    await prisma.publisher.update({
      where: { id },
      data: { verificationStatus: status },
    });
    revalidatePath('/dashboard/admin/pending-publishers');
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Pending Publishers (Verification)</h1>
      <div className="bg-white rounded-md border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.user.email}</TableCell>
                <TableCell><StatusBadge status="PENDING" /></TableCell>
                <TableCell className="text-right space-x-2">
                  <form action={handleVerify.bind(null, p.id, 'APPROVED')} className="inline">
                    <Button type="submit" size="sm" className="bg-[#16A34A] text-white hover:bg-[#16A34A]/80">
                      Approve
                    </Button>
                  </form>
                  <form action={handleVerify.bind(null, p.id, 'REJECTED')} className="inline">
                    <Button type="submit" size="sm" variant="outline" className="border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10">
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