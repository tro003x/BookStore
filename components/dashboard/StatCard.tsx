import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-[#E5E7EB] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>
          <p className="text-2xl font-semibold text-[#0C0A00]">{value}</p>
        </div>
        {icon && <div className="text-[#2DD4BF]">{icon}</div>}
      </CardContent>
    </Card>
  );
}