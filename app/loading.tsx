import BookCardSkeleton from '@/components/BookCardSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <section className="bg-[#1A1D1E] py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="h-12 bg-white/10 rounded-lg animate-pulse w-3/4" />
              <div className="h-6 bg-white/10 rounded-lg animate-pulse w-full" />
              <div className="h-6 bg-white/10 rounded-lg animate-pulse w-2/3" />
            </div>
            <div className="h-64 md:h-80 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-[#E5E7EB] rounded-md animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}