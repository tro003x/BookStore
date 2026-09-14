export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#E5E7EB] ${className}`}
    />
  );
}