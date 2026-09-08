import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/dashboard/StatusBadge';

export default async function AuthorBooksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div>Unauthorized</div>;

  const author = await prisma.author.findUnique({
    where: { userId: session.user.id },
    include: {
      books: {
        include: {
          category: true,
          _count: { select: { purchaseItems: true } }
        }
      }
    },
  });

  const books = author?.books || [];

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
            {books.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell>{b.authorName}</TableCell> {/* FIXED */}
                <TableCell>${Number(b.price).toFixed(2)}</TableCell>
                <TableCell>{b.category.name}</TableCell>
                <TableCell>{b._count.purchaseItems}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}