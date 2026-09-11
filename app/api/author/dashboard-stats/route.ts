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
      dates.push(
        `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      );
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
    const totalCopiesSold = books.reduce(
      (sum, b) => sum + b.purchaseItems.length,
      0
    );
    const totalRevenue = books.reduce(
      (sum, b) =>
        sum +
        b.purchaseItems.reduce(
          (s, item) => s + Number(item.priceAtPurchase),
          0
        ),
      0
    );

    const now = new Date();

    // --- Weekly (last 7 days) ---
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekDays = generateDateRange(weekStart, now, 'day');
    const weekMap: Record<string, number> = {};
    books.forEach((b) => {
      b.purchaseItems.forEach((item) => {
        const date = new Date(item.purchase.purchasedAt);
        const key = date.toISOString().split('T')[0];
        if (date >= weekStart) {
          weekMap[key] = (weekMap[key] || 0) + 1;
        }
      });
    });
    const weeklyChart = weekDays.map((day) => ({
      day,
      count: weekMap[day] || 0,
    }));

    // --- Monthly (last 6 months) ---
    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 5);
    const months = generateDateRange(monthStart, now, 'month');
    const monthMap: Record<string, number> = {};
    books.forEach((b) => {
      b.purchaseItems.forEach((item) => {
        const date = new Date(item.purchase.purchasedAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (date >= monthStart) {
          monthMap[key] = (monthMap[key] || 0) + 1;
        }
      });
    });
    const chartData = months.map((month) => ({
      month,
      count: monthMap[month] || 0,
    }));

    // --- Yearly (last 12 months) ---
    const yearStart = new Date(now);
    yearStart.setMonth(yearStart.getMonth() - 11);
    const yearMonths = generateDateRange(yearStart, now, 'month');
    const yearMap: Record<string, number> = {};
    books.forEach((b) => {
      b.purchaseItems.forEach((item) => {
        const date = new Date(item.purchase.purchasedAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (date >= yearStart) {
          yearMap[key] = (yearMap[key] || 0) + 1;
        }
      });
    });
    const yearlyChart = yearMonths.map((month) => ({
      month,
      count: yearMap[month] || 0,
    }));

    return NextResponse.json({
      totalBooks,
      totalCopiesSold,
      totalRevenue,
      chartData,
      weeklyChart,
      yearlyChart,
    });
  } catch (error) {
    console.error('Author stats error:', error);
    return NextResponse.json({
      totalBooks: 0,
      totalCopiesSold: 0,
      totalRevenue: 0,
      chartData: [],
      weeklyChart: [],
      yearlyChart: [],
    });
  }
}