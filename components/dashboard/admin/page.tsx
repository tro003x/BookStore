'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, CheckCircle, DollarSign, Clock } from 'lucide-react';

interface Stats {
  totalBooks: number;
  totalPublishers: number;
  totalRevenue: number;
  pendingBooks: number;
  pendingPublishers: number;
  pendingVerification: number;
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
      {/* Quick action cards – replaced by stat cards below */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
              <p className="text-sm font-medium text-[#6B7280]">Publishers</p>
              <p className="text-2xl font-semibold text-[#0C0A00]">{stats?.totalPublishers || 0}</p>
            </div>
            <Users className="h-5 w-5 text-[#2DD4BF]" />
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

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Pending Approvals</p>
              <p className="text-2xl font-semibold text-[#0C0A00]">
                {(stats?.pendingBooks || 0) + (stats?.pendingPublishers || 0) + (stats?.pendingVerification || 0)}
              </p>
            </div>
            <Clock className="h-5 w-5 text-[#DC2626]" />
          </CardContent>
        </Card>
      </div>

      {/* Additional info: pending counts as badges */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="outline" className="bg-white border-[#E5E7EB]">
          Pending Books: {stats?.pendingBooks || 0}
        </Badge>
        <Badge variant="outline" className="bg-white border-[#E5E7EB]">
          Pending Publishers: {stats?.pendingPublishers || 0}
        </Badge>
        <Badge variant="outline" className="bg-white border-[#E5E7EB]">
          Pending Verification: {stats?.pendingVerification || 0}
        </Badge>
      </div>
    </div>
  );
}