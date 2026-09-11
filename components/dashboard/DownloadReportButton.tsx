'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function DownloadReportButton({
  endpoint,
  label = 'Download Report',
}: {
  endpoint: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to generate report');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boistore-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="bg-[#4B5D45] hover:bg-[#3E4C39] text-white font-medium"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          Preparing...
        </span>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" /> {label}
        </>
      )}
    </Button>
  );
}