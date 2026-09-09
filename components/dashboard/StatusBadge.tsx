import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAID: 'bg-[#2DD4BF] text-white',
    UNPAID: 'bg-[#6B7280] text-white',
  };

  const normalizedStatus = status.toUpperCase();

  return (
    <Badge className={cn('font-normal', styles[normalizedStatus] || 'bg-gray-100 text-gray-800')}>
      {normalizedStatus}
    </Badge>
  );
}