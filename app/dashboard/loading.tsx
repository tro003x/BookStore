import Spinner from '@/components/Spinner';

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Spinner label="Loading..." />
    </div>
  );
}