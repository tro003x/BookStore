import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function PublisherBooksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div>Unauthorized</div>;

  const publisher = await prisma.publisher.findUnique({
    where: { userId: session.user.id },
    include: { books: { include: { category: true } } },
  });

  const books = publisher?.books || [];

  return (
    <div>
     
      <div className="bg-white rounded-md border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell>{b.authorName}</TableCell> {/* FIXED */}
                <TableCell>${Number(b.price).toFixed(2)}</TableCell>
                <TableCell>{b.category.name}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
                <TableCell>
                  {b.status === 'DRAFT' && b.paymentStatus === 'UNPAID' && (
                    <Link href={`/dashboard/publisher/pay/${b.id}`}>
                      <Button size="sm" className="bg-[#A85C32] text-white hover:bg-[#A85C32]/80">
                        Pay $10
                      </Button>
                    </Link>
                  )}
                  {b.paymentStatus === 'PAID' && <span className="text-xs text-[#16A34A]">Paid</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}