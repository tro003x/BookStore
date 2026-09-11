'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  text: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
}

export default function ReviewSection({ bookId }: { bookId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(`/api/reviews?bookId=${bookId}`);
      const data = await res.json();
      setReviews(data);
      setLoading(false);
    };
    fetchReviews();
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please login to review');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, rating, text }),
    });

    if (res.ok) {
      toast.success('Review submitted');
      setText('');
      setRating(5);
      const refreshRes = await fetch(`/api/reviews?bookId=${bookId}`);
      const data = await refreshRes.json();
      setReviews(data);
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent:
      totalReviews > 0
        ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100
        : 0,
  }));

  const renderStars = (value: number, size = 'h-4 w-4') => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(value)
              ? 'fill-[#F59E0B] text-[#F59E0B]'
              : 'text-[#D1D5DB]'
            }`}
        />
      ))}
    </div>
  );

  const initials = (name: string | null, email: string) => {
    const source = name || email.split('@')[0];
    return source.slice(0, 2).toUpperCase();
  };

  if (loading) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 flex flex-col items-center gap-3">
      <div className="h-8 w-8 rounded-full border-4 border-[#E5E7EB] border-t-[#14B8A6] animate-spin" />
      <p className="text-sm text-[#6B7280]">Loading reviews...</p>
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* Header + Summary */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 md:p-8">
        <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#1A1D1E] mb-6">
          Customer Reviews
        </h2>

        {totalReviews === 0 ? (
          <p className="text-sm text-[#6B7280]">
            No reviews yet. Be the first to share your thoughts.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Average */}
            <div className="flex flex-col items-center justify-center text-center md:border-r border-[#E5E7EB] md:pr-8">
              <p className="font-['IBM_Plex_Mono'] text-5xl font-bold text-[#1A1D1E] mb-2">
                {averageRating.toFixed(1)}
              </p>
              {renderStars(averageRating, 'h-5 w-5')}
              <p className="text-sm text-[#6B7280] mt-2">
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Right: Distribution */}
            <div className="md:col-span-2 space-y-2">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <span className="text-sm text-[#6B7280] w-8 shrink-0">
                    {d.star}★
                  </span>
                  <div className="flex-1 h-2 bg-[#F5F2EC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B] transition-all duration-500"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                  <span className="text-sm text-[#6B7280] w-10 text-right">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review list */}
      {totalReviews > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-lg border border-[#E5E7EB] p-5 md:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-[#14B8A6]/15 text-[#0D9488] flex items-center justify-center font-semibold text-sm shrink-0">
                  {initials(r.user.name, r.user.email)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="font-medium text-[#1A1D1E]">
                      {r.user.name || r.user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="mt-1">{renderStars(r.rating, 'h-3.5 w-3.5')}</div>
                  {r.text && (
                    <p className="mt-3 text-sm text-[#1A1D1E]/80 leading-relaxed">
                      {r.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write a review */}
      {session ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 md:p-8">
          <h3 className="font-['Fraunces'] text-xl font-semibold text-[#1A1D1E] mb-1">
            Write a Review
          </h3>
          <p className="text-sm text-[#6B7280] mb-5">
            Share your experience with other readers.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1A1D1E] mb-2">
                Your Rating
              </label>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(i)}
                    onClick={() => setRating(i)}
                    className="p-0.5 transition-transform hover:scale-110"
                    aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${i <= (hoverRating || rating)
                          ? 'fill-[#F59E0B] text-[#F59E0B]'
                          : 'text-[#D1D5DB]'
                        }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-[#6B7280]">
                  {hoverRating || rating} / 5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1D1E] mb-2">
                Your Review
              </label>
              <textarea
                placeholder="What did you think of this book?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg p-3 text-sm text-[#1A1D1E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-[#14B8A6] resize-none transition"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#4B5D45] hover:bg-[#3E4C39] hover:-translate-y-0.5 hover:shadow-md text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 text-center">
          <p className="text-sm text-[#6B7280]">
            <a
              href="/login"
              className="text-[#14B8A6] hover:underline font-medium"
            >
              Log in
            </a>{' '}
            to leave a review.
          </p>
        </div>
      )}
    </div>
  );
}