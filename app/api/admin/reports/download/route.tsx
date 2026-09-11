import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import { buildPdf } from '@/lib/pdf/renderPDF';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const purchases = await prisma.purchase.findMany({
      include: {
        user: { select: { email: true, name: true } },
        items: {
          include: {
            book: {
              include: { publisher: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    const totalRevenue = purchases.reduce(
      (s, p) => s + Number(p.totalAmount),
      0
    );
    const totalCopies = purchases.reduce((s, p) => s + p.items.length, 0);

    const bookStats: Record<
      string,
      { title: string; publisher: string; copies: number; revenue: number }
    > = {};
    purchases.forEach((p) => {
      p.items.forEach((item) => {
        if (!bookStats[item.bookId]) {
          bookStats[item.bookId] = {
            title: item.book.title,
            publisher: item.book.publisher.name,
            copies: 0,
            revenue: 0,
          };
        }
        bookStats[item.bookId].copies += item.quantity;
        bookStats[item.bookId].revenue +=
          Number(item.priceAtPurchase) * item.quantity;
      });
    });

    const bookRows = Object.values(bookStats)
      .sort((a, b) => b.revenue - a.revenue)
      .map((b) => ({
        title: b.title,
        publisher: b.publisher,
        copies: b.copies,
        revenue: `$${b.revenue.toFixed(2)}`,
      }));

    const purchaseRows = purchases.map((p) => ({
      date: new Date(p.purchasedAt).toLocaleDateString(),
      customer: p.user.email,
      items: p.items.map((i) => i.book.title).join(', '),
      copies: p.items.length,
      amount: `$${Number(p.totalAmount).toFixed(2)}`,
    }));

    const pdfBuffer = await buildPdf({
      title: 'Revenue Report',
      subtitle: 'BoiStore — Admin',
      summary: [
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
        { label: 'Total Purchases', value: String(purchases.length) },
        { label: 'Total Copies Sold', value: String(totalCopies) },
      ],
      tables: [
        {
          title: 'Sales by Book',
          columns: [
            { header: 'Title', key: 'title', flex: 3 },
            { header: 'Publisher', key: 'publisher', flex: 2 },
            { header: 'Copies', key: 'copies', flex: 1 },
            { header: 'Revenue', key: 'revenue', flex: 1.5 },
          ],
          rows: bookRows,
        },
        {
          title: 'Purchase Details',
          columns: [
            { header: 'Date', key: 'date', flex: 1.5 },
            { header: 'Customer', key: 'customer', flex: 3 },
            { header: 'Items', key: 'items', flex: 4 },
            { header: 'Copies', key: 'copies', flex: 1 },
            { header: 'Amount', key: 'amount', flex: 1.5 },
          ],
          rows: purchaseRows,
        },
      ],
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="boistore-revenue-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}