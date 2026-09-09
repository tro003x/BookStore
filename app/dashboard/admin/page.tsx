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
import { Users, BookOpen, DollarSign, Clock } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

interface Stats {
  totalBooks: number;
  totalPublishers: number;
  totalRevenue: number;
  pendingBooks: number;
  pendingPublishers: number;
  pendingVerification: number;
  chartData: { month: string; amount: number }[];
  weeklyChart: { day: string; amount: number }[];
  yearlyChart: { month: string; amount: number }[];
}

export default function AdminDashboardPage() {
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
    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard-stats');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Stats error:', err);
        setStats({
          totalBooks: 0,
          totalPublishers: 0,
          totalRevenue: 0,
          pendingBooks: 0,
          pendingPublishers: 0,
          pendingVerification: 0,
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

  if (loading) return <div className="p-8">Loading...</div>;

  const pendingTotal = (stats?.pendingBooks || 0) + (stats?.pendingPublishers || 0) + (stats?.pendingVerification || 0);

  // Ensure charts always have data (even empty)
  const weeklyData = stats?.weeklyChart && stats.weeklyChart.length > 0 ? stats.weeklyChart : [{ day: 'No data', amount: 0 }];
  const monthlyData = stats?.chartData && stats.chartData.length > 0 ? stats.chartData : [{ month: 'No data', amount: 0 }];
  const yearlyData = stats?.yearlyChart && stats.yearlyChart.length > 0 ? stats.yearlyChart : [{ month: 'No data', amount: 0 }];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Books"
          value={stats?.totalBooks || 0}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Publishers"
          value={stats?.totalPublishers || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingTotal}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Weekly + Monthly side by side */}
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
                  <Bar dataKey="amount" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
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
                  <Bar dataKey="amount" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly chart full width */}
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
                <Bar dataKey="amount" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}