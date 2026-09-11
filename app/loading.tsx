import Spinner from '@/components/Spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC]">
      <Spinner size="lg" label="Loading..." />
    </div>
  );
}