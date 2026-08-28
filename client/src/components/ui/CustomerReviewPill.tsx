import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomerReviewPillProps {
  rating?: number | string;
  totalReviews?: string;
  subtext?: string;
  className?: string;
  variant?: 'dark' | 'light' | 'glass';
  compact?: boolean;
}

export const CustomerReviewPill: React.FC<CustomerReviewPillProps> = ({
  rating = '4.95',
  totalReviews = '1K reviews',
  subtext = 'Trusted by 1000+ customers across India',
  className = '',
  variant = 'dark',
  compact = false,
}) => {
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80',
  ];

  const variantStyles = {
    dark: 'bg-[#18191B] border border-white/10 text-white shadow-2xl',
    glass: 'bg-black/85 backdrop-blur-md border border-white/15 text-white shadow-2xl',
    light: 'bg-white border border-neutral-200 text-[#171C1B] shadow-lg',
  };

  const avatarBorder = variant === 'light' ? 'border-white' : 'border-[#18191B]';

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl ${variantStyles[variant]} ${className}`}
      >
        {/* Compact Overlapping Avatars */}
        <div className="flex items-center -space-x-2 shrink-0">
          {avatars.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Customer ${idx + 1}`}
              className={`w-6 h-6 rounded-full object-cover border-2 ${avatarBorder} shadow-xs`}
            />
          ))}
          <div className={`w-6 h-6 rounded-full bg-[#242629] border-2 ${avatarBorder} text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-xs`}>
            +99
          </div>
        </div>

        {/* Compact Rating */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-[#FF9800]">
              {[...Array(5)].map((_, s) => (
                <Star key={s} className="w-3 h-3 fill-[#FF9800] text-[#FF9800]" />
              ))}
            </div>
            <span className="font-bold text-white text-xs leading-none">{rating}</span>
            <span className="text-[10px] text-neutral-400 font-normal leading-none">({totalReviews})</span>
          </div>
          <p className="text-[10px] text-neutral-300 font-medium mt-0.5 leading-none">
            {subtext}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center gap-3.5 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl ${variantStyles[variant]} ${className}`}
    >
      {/* Overlapping Avatar Stack with +99 Badge */}
      <div className="flex items-center -space-x-2.5 shrink-0">
        {avatars.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Customer ${idx + 1}`}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 ${avatarBorder} shadow-sm transition-transform duration-300 hover:scale-110 hover:z-10`}
          />
        ))}
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#242629] border-2 ${avatarBorder} text-white font-mono font-bold text-[10px] sm:text-xs flex items-center justify-center shadow-sm z-10`}>
          +99
        </div>
      </div>

      {/* Star Rating & Statistics */}
      <div className="flex flex-col justify-center text-left">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 5 Solid Orange Stars */}
          <div className="flex items-center gap-0.5 text-[#FF9800]">
            {[...Array(5)].map((_, s) => (
              <Star key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#FF9800] text-[#FF9800]" />
            ))}
          </div>

          {/* Rating Number */}
          <span className="text-sm sm:text-base font-bold font-mono tracking-tight leading-none text-white">
            {rating}
          </span>

          {/* Total Reviews Count */}
          <span className="text-[11px] sm:text-xs text-neutral-400 font-sans font-medium leading-none">
            ({totalReviews})
          </span>
        </div>

        {/* Subtext */}
        <p className="text-[11px] sm:text-xs text-neutral-300 font-medium mt-1 leading-none">
          {subtext}
        </p>
      </div>
    </motion.div>
  );
};
