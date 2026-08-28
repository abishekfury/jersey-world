import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  // 12 curated football jersey thumbnails for the circular ring
  const circleItems = [
    {
      img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80',
      tilt: '-rotate-12',
    },
    {
      img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=300&q=80',
      tilt: 'rotate-6',
    },
    {
      img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
      tilt: 'rotate-12',
    },
    {
      img: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=300&q=80',
      tilt: '-rotate-6',
    },
    {
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      tilt: 'rotate-15',
    },
    {
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      tilt: '-rotate-15',
    },
    {
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      tilt: 'rotate-8',
    },
    {
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      tilt: '-rotate-8',
    },
    {
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80',
      tilt: 'rotate-12',
    },
    {
      img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80',
      tilt: '-rotate-10',
    },
    {
      img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=300&q=80',
      tilt: 'rotate-14',
    },
    {
      img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=300&q=80',
      tilt: '-rotate-4',
    },
  ];

  return (
    <div className="bg-white text-black min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden select-none">
      {/* Central Circular Stage (Matches Reference Screenshot media_1787810622153.png) */}
      <div className="relative w-72 h-72 sm:w-[440px] sm:h-[440px] flex items-center justify-center my-6">
        {/* Large Faint 404 Typography */}
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-8xl sm:text-[160px] font-black tracking-tight text-[#E5E7EB] font-display pointer-events-none select-none z-0"
        >
          404
        </motion.span>

        {/* 12 Floating Circular Product Thumbnails Ring */}
        {circleItems.map((item, index) => {
          const total = circleItems.length;
          const angle = (index / total) * (2 * Math.PI) - Math.PI / 2; // Start from top 12 o'clock
          // Radius: 130px on small screens, 190px on desktop
          const radiusSm = 120;
          const radiusLg = 185;

          const xSm = Math.cos(angle) * radiusSm;
          const ySm = Math.sin(angle) * radiusSm;
          const xLg = Math.cos(angle) * radiusLg;
          const yLg = Math.sin(angle) * radiusLg;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 + 0.1, duration: 0.4 }}
              style={
                {
                  '--x-sm': `${xSm}px`,
                  '--y-sm': `${ySm}px`,
                  '--x-lg': `${xLg}px`,
                  '--y-lg': `${yLg}px`,
                } as React.CSSProperties
              }
              className={`absolute z-10 w-10 h-12 sm:w-14 sm:h-16 bg-[#F3F4F6] border border-gray-200/80 shadow-md overflow-hidden ${item.tilt} hover:scale-125 hover:z-20 hover:rotate-0 transition-all duration-300 [transform:translate(var(--x-sm),var(--y-sm))] sm:[transform:translate(var(--x-lg),var(--y-lg))]`}
            >
              <img
                src={item.img}
                alt={`Jersey Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Subtitle & Action (Matches Screenshot) */}
      <div className="text-center space-y-5 relative z-20 mt-4">
        <p className="text-sm sm:text-base font-medium text-gray-700">
          Sorry, We couldn’t find this page
        </p>

        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-black text-black font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all group"
          >
            Explore All Kits <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
