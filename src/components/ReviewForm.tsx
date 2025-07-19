import React, { useState } from 'react';

interface ReviewFormProps {
  productId: number;
  onReviewAdded: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !authorName.trim()) {
      setError('Please provide a rating and your name.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment, author_name: authorName }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit review.');
      }
      
      setStatus('success');
      // Reset form
      setRating(0);
      setComment('');
      setAuthorName('');
      onReviewAdded();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl cursor-pointer bg-transparent border-none p-0"
              aria-label={`Rate ${star} stars`}
            >
              <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="author_name" className="block text-sm font-medium text-gray-700">Your Name</label>
        <input
          id="author_name"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"
          required
        />
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Review (Optional)</label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition-colors"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Review'}
      </button>

      {status === 'success' && <p className="text-green-600 text-sm mt-2">Thank you for your review!</p>}
      {status === 'error' && error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default ReviewForm;
