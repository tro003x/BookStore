'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Period = 'weekly' | 'monthly' | 'yearly';

interface ReportData {
  period: string;
  totalRevenue: number;
  totalSales: number;
  chartData: { date: string; amount: number }[];
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('monthly');
  const [data, setData] = useState<ReportData | null>(null);
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

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/reports?period=${period}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, status, session, router]);

  const downloadReport = async () => {
    const res = await fetch(`/api/admin/reports?period=${period}`);
    const json = await res.json();
    const text = `Report: ${period}\nTotal Revenue: $${json.totalRevenue.toFixed(2)}\nTotal Sales: ${json.totalSales}\n\nSales by Day:\n${json.chartData.map((d: { date: string; amount: number }) => `${d.date}: $${d.amount.toFixed(2)}`).join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${period}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">No data available</div>;

  return (
    <div className="min-h-screen bg-[#EFE9DC] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-['Fraunces'] text-3xl font-semibold mb-6">Sales Reports</h1>

        <div className="flex gap-4 mb-6">
          {['weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as Period)}
              className={`px-4 py-2 rounded ${period === p ? 'bg-[#4B5D45] text-white' : 'bg-[#C9BFA8]'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="font-['IBM_Plex_Mono'] text-2xl text-[#A85C32]">
                ${data.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="font-['IBM_Plex_Mono'] text-2xl text-[#A85C32]">
                {data.totalSales}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-['Fraunces'] text-lg font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#4B5D45" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button
          onClick={downloadReport}
          className="bg-[#4B5D45] text-white px-4 py-2 rounded hover:opacity-90"
        >
          Download Report (TXT)
        </button>
      </div>
    </div>
  );
}