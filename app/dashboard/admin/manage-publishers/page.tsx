import { prisma } from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/dashboard/StatusBadge';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function ManagePublishersPage() {
  const publishers = await prisma.publisher.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  async function deletePublisher(id: string) {
    'use server';
    await prisma.publisher.delete({ where: { id } });
    revalidatePath('/dashboard/admin/manage-publishers');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Publishers</h1>
        {/* <Link href="/dashboard/admin/manage-publishers/create">
          <Button className="bg-[#2DD4BF] text-white hover:bg-[#2DD4BF]/80">Add Publisher</Button>
        </Link> */}
      </div>
      <div className="bg-white rounded-md border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.user.email}</TableCell>
                <TableCell>{p.phone || '—'}</TableCell>
                <TableCell><StatusBadge status={p.approved ? 'APPROVED' : 'PENDING'} /></TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/dashboard/admin/manage-publishers/edit/${p.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6B7280]">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <form action={deletePublisher.bind(null, p.id)} className="inline">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                      <Trash2 className="h-4 w-4" />
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