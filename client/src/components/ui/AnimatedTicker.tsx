import React from 'react';

interface AnimatedTickerProps {
  items: string[];
  direction?: 'left' | 'right';
  speed?: number; // duration in seconds
  className?: string;
  itemClassName?: string;
}

export const AnimatedTicker: React.FC<AnimatedTickerProps> = ({
  items,
  direction = 'left',
  speed = 28,
  className = '',
  itemClassName = '',
}) => {
  const animationName = direction === 'left' ? 'ticker-scroll-left' : 'ticker-scroll-right';

  return (
    <div className={`overflow-hidden whitespace-nowrap flex select-none ${className}`}>
      <div
        className="flex shrink-0 items-center gap-8 py-3"
        style={{
          animation: `${animationName} ${speed}s linear infinite`,
        }}
      >
        {items.concat(items).map((item, idx) => (
          <div key={idx} className={`inline-flex items-center gap-4 ${itemClassName}`}>
            <span>{item}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="flex shrink-0 items-center gap-8 py-3"
        style={{
          animation: `${animationName} ${speed}s linear infinite`,
        }}
      >
        {items.concat(items).map((item, idx) => (
          <div key={`dup-${idx}`} className={`inline-flex items-center gap-4 ${itemClassName}`}>
            <span>{item}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
          </div>
        ))}
      </div>
    </div>
  );
};

