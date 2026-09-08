import { prisma } from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { revalidatePath } from 'next/cache';

export default async function AdminBooksPage() {
  const books = await prisma.book.findMany({
    where: { status: 'PENDING' },
    include: { category: true, publisher: { select: { name: true } } },
  });

  async function approveBook(id: string) {
    'use server';
    await prisma.book.update({
      where: { id },
      data: { status: 'APPROVED', publishedAt: new Date() },
    });
    revalidatePath('/dashboard/admin/books');
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Pending Books</h1>
      <div className="bg-white rounded-md border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Publisher</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
         <TableBody>
  {books.map((b) => (
    <TableRow key={b.id}>
      <TableCell className="font-medium">{b.title}</TableCell>
      <TableCell>{b.authorName}</TableCell>
      <TableCell>{b.category.name}</TableCell>
      <TableCell>{b.publisher.name}</TableCell>
      <TableCell><StatusBadge status="PENDING" /></TableCell>
      <TableCell className="text-right">
        <form action={approveBook.bind(null, b.id)}>
          <Button size="sm" className="bg-[#2DD4BF] text-white hover:bg-[#2DD4BF]/80">
            Approve
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