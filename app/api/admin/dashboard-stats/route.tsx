import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';


function generateDateRange(start: Date, end: Date, unit: 'day' | 'month') {
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    if (unit === 'day') {
      dates.push(current.toISOString().split('T')[0]);
    } else {
      dates.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    }
    if (unit === 'day') {
      current.setDate(current.getDate() + 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }
  return dates;
}

export async function GET(req: Request) {
  try {
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

    
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6); // 7 days including today
    const weekDays = generateDateRange(weekStart, now, 'day');
    const weekMap: Record<string, number> = {};
    purchases.forEach(p => {
      const date = new Date(p.purchasedAt);
      const key = date.toISOString().split('T')[0];
      if (date >= weekStart) {
        weekMap[key] = (weekMap[key] || 0) + Number(p.totalAmount);
      }
    });
    const weeklyChart = weekDays.map(day => ({
      day,
      amount: weekMap[day] || 0,
    }));

    // --- Monthly (last 6 months) ---
    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 5); // 6 months including current
    const months = generateDateRange(monthStart, now, 'month');
    const monthMap: Record<string, number> = {};
    purchases.forEach(p => {
      const date = new Date(p.purchasedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (date >= monthStart) {
        monthMap[key] = (monthMap[key] || 0) + Number(p.totalAmount);
      }
    });
    const chartData = months.map(month => ({
      month,
      amount: monthMap[month] || 0,
    }));

    // --- Yearly (last 12 months) ---
    const yearStart = new Date(now);
    yearStart.setMonth(yearStart.getMonth() - 11); // 12 months including current
    const yearMonths = generateDateRange(yearStart, now, 'month');
    const yearMap: Record<string, number> = {};
    purchases.forEach(p => {
      const date = new Date(p.purchasedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (date >= yearStart) {
        yearMap[key] = (yearMap[key] || 0) + Number(p.totalAmount);
      }
    });
    const yearlyChart = yearMonths.map(month => ({
      month,
      amount: yearMap[month] || 0,
    }));

    return NextResponse.json({
      totalPublishers,
      pendingPublishers,
      totalBooks,
      pendingBooks,
      totalRevenue,
      totalPurchases: purchases.length,
      pendingVerification,
      chartData,
      weeklyChart,
      yearlyChart,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      totalPublishers: 0,
      pendingPublishers: 0,
      totalBooks: 0,
      pendingBooks: 0,
      totalRevenue: 0,
      totalPurchases: 0,
      pendingVerification: 0,
      chartData: [],
      weeklyChart: [],
      yearlyChart: [],
    });
  }
}