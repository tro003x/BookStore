import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [totalPublishers, pendingPublishers, totalBooks, pendingBooks, purchases, pendingAuthors, pendingPubs] = await Promise.all([
    prisma.publisher.count(),
    prisma.publisher.count({ where: { approved: false } }),
    prisma.book.count(),
    prisma.book.count({ where: { status: 'PENDING' } }),
    prisma.purchase.findMany({ select: { totalAmount: true, purchasedAt: true } }),
    prisma.author.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.publisher.count({ where: { verificationStatus: 'PENDING' } }),
  ]);

  const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const pendingVerification = pendingAuthors + pendingPubs;

  // Chart data: group purchases by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentPurchases = purchases.filter(p => new Date(p.purchasedAt) >= sixMonthsAgo);
  const monthMap: Record<string, number> = {};
  recentPurchases.forEach(p => {
    const date = new Date(p.purchasedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = (monthMap[key] || 0) + Number(p.totalAmount);
  });
  const chartData = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amount]) => ({ date, amount }));

  return NextResponse.json({
    totalPublishers,
    pendingPublishers,
    totalBooks,
    pendingBooks,
    totalRevenue,
    totalPurchases: purchases.length,
    pendingVerification,
    chartData,
  });
}