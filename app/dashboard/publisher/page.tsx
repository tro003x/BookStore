'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, DollarSign, ShoppingBag } from 'lucide-react';

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
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Stats error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [status, session, router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Total Books</p>
              <p className="text-2xl font-semibold text-[#0C0A00]">{stats?.totalBooks || 0}</p>
            </div>
            <BookOpen className="h-5 w-5 text-[#2DD4BF]" />
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Copies Sold</p>
              <p className="text-2xl font-semibold text-[#0C0A00]">{stats?.totalCopiesSold || 0}</p>
            </div>
            <ShoppingBag className="h-5 w-5 text-[#2DD4BF]" />
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Revenue</p>
              <p className="text-2xl font-semibold text-[#0C0A00]">
                ${stats?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign className="h-5 w-5 text-[#2DD4BF]" />
          </CardContent>
        </Card>
      </div>

      {stats?.chartData && stats.chartData.length > 0 && (
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
      )}
    </div>
  );
}