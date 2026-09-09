'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, DollarSign, ShoppingBag } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

interface Stats {
  totalBooks: number;
  totalCopiesSold: number;
  totalRevenue: number;
  chartData: { month: string; revenue: number }[];
}

export default function PublisherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.error('Stats fetch error:', err);
        setError('Failed to load stats');
        setStats({
          totalBooks: 0,
          totalCopiesSold: 0,
          totalRevenue: 0,
          chartData: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [status, session, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div>
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

      {stats?.chartData && stats.chartData.length > 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="font-['Fraunces'] text-lg">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-5 text-center text-[#6B7280]">
            No revenue data available yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}