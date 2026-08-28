import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const [radius, setRadius] = useState(210);

  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 640) {
        setRadius(135);
      } else if (window.innerWidth < 1024) {
        setRadius(195);
      } else {
        setRadius(230);
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // 12 curated apparel and accessories items matching the reference circular ring
  const circleItems = [
    {
      img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
      title: 'T-Shirt',
      rotation: 0,
    },
    {
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
      title: 'Sneakers',
      rotation: 25,
    },
    {
      img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
      title: 'Denim Jeans',
      rotation: 45,
    },
    {
      img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80',
      title: 'Sweatshirt',
      rotation: 15,
    },
    {
      img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
      title: 'Pattern Kit',
      rotation: -30,
    },
    {
      img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80',
      title: 'Navy Jacket',
      rotation: 30,
    },
    {
      img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80',
      title: 'Lace Shirt',
      rotation: 0,
    },
    {
      img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
      title: 'Leather Bag',
      rotation: -25,
    },
    {
      img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80',
      title: 'High-top Shoes',
      rotation: -45,
    },
    {
      img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=300&q=80',
      title: 'Sunglasses',
      rotation: -10,
    },
    {
      img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80',
      title: 'Shoulder Bag',
      rotation: 25,
    },
    {
      img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=300&q=80',
      title: 'Silver Watch',
      rotation: -30,
    },
  ];

  return (
    <div className="bg-white text-black min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 sm:py-16 select-none font-sans overflow-hidden">
      {/* Central Circular Stage */}
      <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] lg:w-[560px] lg:h-[560px] flex items-center justify-center">
        {/* Giant Light Gray 404 in the exact center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[120px] sm:text-[180px] lg:text-[210px] font-black text-[#E4E6EA] font-sans tracking-tight leading-none select-none"
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-xs sm:text-sm lg:text-base font-medium text-[#2E3033] mt-[-10px] sm:mt-[-16px] text-center font-sans"
          >
            Sorry, We couldn’t find this page
          </motion.p>
        </div>

        {/* 12 Floating Product Thumbnails in Perfect Circular Orbit around 404 */}
        {circleItems.map((item, index) => {
          const total = circleItems.length;
          // Start from 12 o'clock (-90 deg / -PI/2)
          const angleRad = (index / total) * 2 * Math.PI - Math.PI / 2;
          const x = Math.round(Math.cos(angleRad) * radius);
          const y = Math.round(Math.sin(angleRad) * radius);

          return (
            <div
              key={index}
              className="absolute z-10"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.08 + index * 0.03,
                  type: 'spring',
                  stiffness: 280,
                  damping: 20,
                }}
                whileHover={{ scale: 1.25, zIndex: 40 }}
                className="w-12 h-14 sm:w-16 sm:h-18 lg:w-20 lg:h-22 bg-[#F3F4F6] shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer border border-neutral-200/80"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Return Home CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-8 relative z-20"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-7 py-3 bg-black text-white hover:bg-[#FF5722] text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-md group"
        >
          Back to Homepage <ArrowUpRight className="w-4 h-4 transition-transform group-hover:rotate-45 group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </div>
  );
};
