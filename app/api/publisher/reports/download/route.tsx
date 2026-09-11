import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { buildPdf } from '@/lib/pdf/renderPDF';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'PUBLISHER' || !user.publisher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const books = await prisma.book.findMany({
      where: { publisherId: user.publisher.id },
      include: {
        purchaseItems: {
          include: {
            purchase: { include: { user: { select: { email: true } } } },
          },
        },
      },
    });

    const totalCopies = books.reduce((s, b) => s + b.purchaseItems.length, 0);
    const totalRevenue = books.reduce(
      (s, b) =>
        s + b.purchaseItems.reduce((x, i) => x + Number(i.priceAtPurchase), 0),
      0
    );

    const bookRows = books.map((b) => {
      const copies = b.purchaseItems.length;
      const revenue = b.purchaseItems.reduce(
        (x, i) => x + Number(i.priceAtPurchase),
        0
      );
      return {
        title: b.title,
        price: `$${Number(b.price).toFixed(2)}`,
        copies,
        revenue: `$${revenue.toFixed(2)}`,
      };
    });

    const saleRows: Record<string, string | number>[] = [];
    books.forEach((b) => {
      b.purchaseItems.forEach((item) => {
        saleRows.push({
          date: new Date(item.purchase.purchasedAt).toLocaleDateString(),
          book: b.title,
          customer: item.purchase.user.email,
          price: `$${Number(item.priceAtPurchase).toFixed(2)}`,
        });
      });
    });

    const pdfBuffer = await buildPdf({
      title: 'Sales Report',
      subtitle: `Publisher — ${user.publisher.name}`,
      summary: [
        { label: 'Total Books', value: String(books.length) },
        { label: 'Total Copies Sold', value: String(totalCopies) },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
      ],
      tables: [
        {
          title: 'Sales by Book',
          columns: [
            { header: 'Title', key: 'title', flex: 3 },
            { header: 'Price', key: 'price', flex: 1.5 },
            { header: 'Copies', key: 'copies', flex: 1 },
            { header: 'Revenue', key: 'revenue', flex: 1.5 },
          ],
          rows: bookRows,
        },
        {
          title: 'Sale Details',
          columns: [
            { header: 'Date', key: 'date', flex: 1.5 },
            { header: 'Book', key: 'book', flex: 3 },
            { header: 'Customer', key: 'customer', flex: 3 },
            { header: 'Price', key: 'price', flex: 1.5 },
          ],
          rows: saleRows,
        },
      ],
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="publisher-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Publisher PDF error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}