import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const period = url.searchParams.get('period') || 'monthly';

  const startDate = new Date();
  if (period === 'weekly') startDate.setDate(startDate.getDate() - 7);
  else if (period === 'monthly') startDate.setMonth(startDate.getMonth() - 1);
  else if (period === 'yearly') startDate.setFullYear(startDate.getFullYear() - 1);

  const purchases = await prisma.purchase.findMany({
    where: {
      purchasedAt: { gte: startDate },
    },
    include: {
      items: { include: { book: { include: { publisher: true } } } },
    },
    orderBy: { purchasedAt: 'asc' },
  });

  const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);

  const grouped: Record<string, number> = {};
  purchases.forEach((p) => {
    const key = p.purchasedAt.toISOString().split('T')[0];
    grouped[key] = (grouped[key] || 0) + Number(p.totalAmount);
  });

  const chartData = Object.entries(grouped).map(([date, amount]) => ({ date, amount }));

  return NextResponse.json({
    period,
    totalRevenue,
    totalSales: purchases.length,
    chartData,
  });
}