'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BookOpen, DollarSign, ShoppingBag } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import DownloadReportButton from '@/components/dashboard/DownloadReportButton';
import VerificationGate from '@/components/dashboard/VerificationGate';

interface Stats {
  totalBooks: number;
  totalCopiesSold: number;
  totalRevenue: number;
  chartData: { month: string; revenue: number }[];
  weeklyChart: { day: string; revenue: number }[];
  yearlyChart: { month: string; revenue: number }[];
}

export default function PublisherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'PUBLISHER') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/publisher/dashboard-stats');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Stats error:', err);
        setStats({
          totalBooks: 0,
          totalCopiesSold: 0,
          totalRevenue: 0,
          chartData: [],
          weeklyChart: [],
          yearlyChart: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [status, session, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.verificationStatus !== 'APPROVED') {
    return (
      <VerificationGate
        role="publisher"
        status={session?.user?.verificationStatus}
      />
    );
  }

  const weeklyData =
    stats?.weeklyChart && stats.weeklyChart.length > 0
      ? stats.weeklyChart
      : [{ day: 'No data', revenue: 0 }];
  const monthlyData =
    stats?.chartData && stats.chartData.length > 0
      ? stats.chartData
      : [{ month: 'No data', revenue: 0 }];
  const yearlyData =
    stats?.yearlyChart && stats.yearlyChart.length > 0
      ? stats.yearlyChart
      : [{ month: 'No data', revenue: 0 }];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Fraunces'] text-2xl font-semibold text-[#0C0A00]">
            Publisher Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Track your sales and revenue
          </p>
        </div>
        <DownloadReportButton
          endpoint="/api/publisher/reports/download"
          label="Download Sales Report"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard
          title="Total Books"
          value={stats?.totalBooks || 0}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Copies Sold"
          value={stats?.totalCopiesSold || 0}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          title="Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
            <CardDescription className="text-xs">Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">6-Month Revenue</CardTitle>
            <CardDescription className="text-xs">Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
          <CardDescription className="text-xs">Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}