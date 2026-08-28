import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Star, ShieldCheck, Sparkles } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('animate-pulse bg-white/5 rounded-lg', className)} />
);

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
        <span className="text-xs text-gray-500">({numReviews})</span>
      )}
    </div>
  );
};

export const ImageWithFallback: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { fallbackText?: string }> = ({
  src,
  alt,
  className,
  fallbackText = 'Jersey',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface-100 flex items-center justify-center">
      {isLoading && <Skeleton className="absolute inset-0 z-10" />}
      {!hasError && src ? (
        <img
          src={src}
          alt={alt || fallbackText}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          className={clsx(
            'transition-opacity duration-300 object-contain w-full h-full',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          {...props}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
          <Sparkles className="w-8 h-8 mb-2 text-gold-400/60 animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-wider">{fallbackText}</span>
        </div>
      )}
    </div>
  );
};
