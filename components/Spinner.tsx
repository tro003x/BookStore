interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function Spinner({ size = 'md', label }: SpinnerProps) {
  const sizeMap = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-14 w-14 border-4',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeMap[size]} rounded-full border-[#E5E7EB] border-t-[#14B8A6] animate-spin`}
      />
      {label && <p className="text-sm text-[#6B7280]">{label}</p>}
    </div>
  );
}