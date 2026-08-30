'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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
      alert('Please login to review');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, rating, text }),
    });

    if (res.ok) {
      setText('');
      setRating(5);
      const fetchReviews = async () => {
        const res = await fetch(`/api/reviews?bookId=${bookId}`);
        const data = await res.json();
        setReviews(data);
      };
      fetchReviews();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const renderStars = (count: number) => {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  };

  if (loading) return <div className="mt-8 text-sm text-gray-500">Loading reviews...</div>;

  return (
    <div className="mt-8 border-t border-[#C9BFA8] pt-6">
      <h2 className="font-['Fraunces'] text-xl font-semibold mb-4">Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#EFE9DC] p-3 rounded border border-[#C9BFA8]">
              <div className="flex justify-between items-center">
                <span className="text-[#A85C32] font-['IBM_Plex_Mono'] text-sm">
                  {renderStars(r.rating)}
                </span>
                <span className="text-xs text-gray-500">
                  {r.user.name || r.user.email.split('@')[0]}
                </span>
              </div>
              {r.text && <p className="text-sm mt-1 text-[#1A1D1E]">{r.text}</p>}
              <span className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {session ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border border-[#C9BFA8] rounded px-2 py-1 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} ★</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Write your review (optional)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-[#C9BFA8] rounded p-2 text-sm"
            rows={3}
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#4B5D45] text-white px-4 py-2 rounded text-sm hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mt-4">
          <a href="/login" className="text-[#4B5D45] hover:underline">Login</a> to leave a review.
        </p>
      )}
    </div>
  );
}