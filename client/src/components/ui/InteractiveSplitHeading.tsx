import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export interface InteractiveSplitHeadingProps {
  prefix: string;
  suffix: string;
  images: string[];
  badge?: string;
  tagline?: string;
  className?: string;
}

// Container & Text Reveal Variants
const headingContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const textMaskVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const InteractiveSplitHeading: React.FC<InteractiveSplitHeadingProps> = ({
  prefix,
  suffix,
  images,
  badge,
  tagline,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Auto-cycle through images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % images.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <motion.div
      variants={headingContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered((prev) => !prev)}
      className={`group cursor-pointer select-none flex flex-col items-center justify-center text-center ${className}`}
    >
      {tagline && (
        <div className="overflow-hidden mb-1.5">
          <motion.span
            variants={textMaskVariants}
            className="text-xs font-bold text-[#FF5722] tracking-widest uppercase block font-mono text-center"
          >
            {tagline}
          </motion.span>
        </div>
      )}

      <div className="flex items-center justify-center gap-x-2 sm:gap-x-3.5">
        {/* Left Prefix Text (with mask reveal) */}
        <div className="overflow-hidden py-1">
          <motion.span
            variants={textMaskVariants}
            animate={{ x: isHovered ? -5 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="text-3xl sm:text-5xl lg:text-[56px] font-normal text-[#171C1B] tracking-tight uppercase font-display leading-none whitespace-nowrap inline-block"
          >
            {prefix}
          </motion.span>
        </div>

        {/* Middle Expandable Media Reveal Pill */}
        <motion.div
          initial={false}
          animate={{
            width: isHovered ? 180 : 0,
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.85,
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 28,
            mass: 0.6,
          }}
          className="overflow-hidden h-9 sm:h-12 lg:h-14 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-xl relative flex items-center justify-center shrink-0 mx-1"
        >
          {/* Animated Image Slideshow */}
          <AnimatePresence mode="wait">
            {images.length > 0 && (
              <motion.img
                key={images[currentImageIdx]}
                src={images[currentImageIdx]}
                alt="Split Preview"
                initial={{ opacity: 0, scale: 1.15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full h-full object-cover object-center"
              />
            )}
          </AnimatePresence>

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Glowing Neon Edge on Hover */}
          <div className="absolute inset-0 border-2 border-[#FF5722]/80 rounded-2xl pointer-events-none animate-pulse" />

          {/* Floating Badge Inside Pill */}
          {badge && (
            <span className="absolute bottom-1 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-xs text-[#FF5722] text-[9px] font-mono font-bold uppercase rounded tracking-wider pointer-events-none">
              {badge}
            </span>
          )}
        </motion.div>

        {/* Right Suffix Text (with mask reveal) */}
        <div className="overflow-hidden py-1">
          <motion.span
            variants={textMaskVariants}
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="text-3xl sm:text-5xl lg:text-[56px] font-normal text-[#171C1B] tracking-tight uppercase font-display leading-none whitespace-nowrap inline-block"
          >
            {suffix}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};
