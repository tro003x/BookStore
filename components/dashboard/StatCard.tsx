import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  return (
    <Card className="border-[#E5E7EB] shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">{title}</p>
            <p className="text-2xl font-semibold text-[#0C0A00] mt-1">{value}</p>
            {change && (
              <p className={cn(
                "text-xs mt-1",
                changeType === 'positive' ? "text-[#16A34A]" : "text-[#DC2626]"
              )}>
                {change}
              </p>
            )}
          </div>
          {icon && <div className="text-[#2DD4BF]">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}