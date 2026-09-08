import { prisma } from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { revalidatePath } from 'next/cache';

export default async function AdminPublishersPage() {
  const publishers = await prisma.publisher.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  async function approvePublisher(id: string) {
    'use server';
    await prisma.publisher.update({
      where: { id },
      data: { approved: true },
    });
    revalidatePath('/dashboard/admin/publishers');
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Publishers</h1>
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
                <TableCell><StatusBadge status={p.approved ? 'APPROVED' : 'PENDING'} /></TableCell>
                <TableCell className="text-right">
                  {!p.approved && (
                    <form action={approvePublisher.bind(null, p.id)}>
                      <Button size="sm" className="bg-[#2DD4BF] text-white hover:bg-[#2DD4BF]/80">
                        Approve
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}