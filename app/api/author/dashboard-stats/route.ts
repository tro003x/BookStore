import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'AUTHOR' || !user.author) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const books = await prisma.book.findMany({
    where: { authorId: user.author.id },
    include: {
      purchaseItems: {
        include: { purchase: true },
      },
    },
  });

  const totalBooks = books.length;
  const totalCopiesSold = books.reduce((sum, b) => sum + b.purchaseItems.length, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthMap: Record<string, number> = {};
  books.forEach(b => {
    b.purchaseItems.forEach(item => {
      const date = new Date(item.purchase.purchasedAt);
      if (date >= sixMonthsAgo) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
      }
    });
  });
  const chartData = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  return NextResponse.json({
    totalBooks,
    totalCopiesSold,
    chartData,
  });
}