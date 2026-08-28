import React from 'react';
import { clsx } from 'clsx';
import { Star } from 'lucide-react';

export const RatingStars: React.FC<{ rating: number; numReviews?: number; size?: 'sm' | 'md' }> = ({
  rating,
  numReviews,
  size = 'md',
}) => {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-gold-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              starSize,
              star <= Math.round(rating)
                ? 'fill-gold-400 text-gold-400'
                : 'text-gray-600'
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-300 ml-1">{rating.toFixed(1)}</span>
      {numReviews !== undefined && (
        <span className="text-xs text-gray-500 font-mono">({numReviews})</span>
      )}
    </div>
  );
};
