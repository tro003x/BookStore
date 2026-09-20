import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { redirect } from 'next/navigation';

export default async function AuthorBooksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div>Unauthorized</div>;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { author: true },
  });

  if (!user?.author) {
    return <div>Author profile not found</div>;
  }

  if (user.author.verificationStatus !== 'APPROVED') {
    redirect('/dashboard/author');
  }

  const books = await prisma.book.findMany({
    where: { authorId: user.author.id },
    include: {
      category: true,
      _count: { select: { purchaseItems: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Books</h1>
      <div className="bg-white rounded-md border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Copies Sold</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[#6B7280]">
                  No books found.
                </TableCell>
              </TableRow>
            ) : (
              books.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.authorName}</TableCell>
                  <TableCell>${Number(b.price).toFixed(2)}</TableCell>
                  <TableCell>{b.category.name}</TableCell>
                  <TableCell>{b._count.purchaseItems}</TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}