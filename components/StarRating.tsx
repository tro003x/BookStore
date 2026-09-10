import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;      // 0 to 5
  count?: number;      // number of reviews
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export default function StarRating({
  rating,
  count = 0,
  size = 'sm',
  showCount = true,
}: StarRatingProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const rounded = Math.round(rating * 2) / 2; // round to nearest 0.5
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${starSize} fill-[#F59E0B] text-[#F59E0B]`}
          />
        ))}

        {/* Half star – overlay technique */}
        {hasHalf && (
          <span className="relative inline-block">
            <Star className={`${starSize} text-[#D1D5DB]`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className={`${starSize} fill-[#F59E0B] text-[#F59E0B]`} />
            </span>
          </span>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${starSize} text-[#D1D5DB]`} />
        ))}
      </div>

      {showCount && (
        <span className="text-xs text-[#6B7280]">
          {rating > 0 ? rating.toFixed(1) : '0.0'}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}