import Skeleton from './Skeleton';

export default function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      <Skeleton className="aspect-[3/4] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3 mt-4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}