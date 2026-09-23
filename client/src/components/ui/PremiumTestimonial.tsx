import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TestimonialStory {
  id: string | number;
  eyebrow?: string;
  quote: string;
  author: string;
  role: string;
  image: string;
}

interface PremiumTestimonialProps {
  stories?: TestimonialStory[];
}

const DEFAULT_STORIES: TestimonialStory[] = [
  {
    id: 1,
    eyebrow: 'Client Stories',
    quote:
      'The team’s approach blended creativity and function perfectly. Our project exceeded all expectations.',
    author: 'Daniel Park',
    role: 'Founder, Horizon Group',
    image: '/images/image2.jpg',
  },
  {
    id: 2,
    eyebrow: 'Collector Stories',
    quote:
      'The player-version fabric is 100% authentic. The official heat-pressed crests, sizing guide, and lightning-fast delivery across India make GOALZA unmatched.',
    author: 'Rohan Kapoor',
    role: 'Verified Matchwear Collector, Mumbai',
    image: '/images/image3.jpg',
  },
  {
    id: 3,
    eyebrow: 'Verified Reviews',
    quote:
      'Ordered the 1998 retro jersey. The collar details and stitching are true to the original final match kit.',
    author: 'Aanay Mehta',
    role: 'Football Enthusiast, Bangalore',
    image: '/images/image1.jpg',
  },
  {
    id: 4,
    eyebrow: 'Client Stories',
    quote:
      'Unbelievable quality and seamless exchange service. The Dri-FIT breathability on pitch and effortless streetwear style make this our top choice.',
    author: 'Sofia Martinez',
    role: 'Verified Buyer, Delhi NCR',
    image: '/images/image9.jpg',
  },
];

export const PremiumTestimonial: React.FC<PremiumTestimonialProps> = ({
  stories = DEFAULT_STORIES,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const total = stories.length;

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next]);

  const currentStory = stories[currentIndex];

  return (
    <section className="py-16 sm:py-24 md:py-32 w-full bg-white border-t border-neutral-200 select-none overflow-hidden">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 max-w-[1820px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Left Column: Eyebrow, Large Serif Quotation, Author & Navigation Arrows */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between min-h-[360px] sm:min-h-[440px] md:min-h-[520px] lg:min-h-[600px] space-y-8">
            {/* Top Eyebrow */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wider text-neutral-800">
                <span className="text-black text-sm">✦</span>
                <span className="font-sans">{currentStory.eyebrow || 'Client Stories'}</span>
              </div>

              {/* Large Editorial Serif Quotation matching Framer reference */}
              <div className="min-h-[160px] sm:min-h-[200px] md:min-h-[240px] flex items-center">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.blockquote
                    key={currentStory.id}
                    initial={{ opacity: 0, y: direction * 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: direction * -15 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[56px] 2xl:text-[62px] font-normal leading-[1.12] text-neutral-900 tracking-tight"
                  >
                    "{currentStory.quote}"
                  </motion.blockquote>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Row: Author Details (Left) + Dark Square Arrow Buttons (Right) */}
            <div className="pt-6 border-t border-neutral-100 flex items-center justify-between gap-6">
              {/* Author & Role */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-0.5"
                >
                  <h4 className="text-base sm:text-lg font-bold text-black font-sans leading-tight">
                    {currentStory.author}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-500 font-sans">
                    {currentStory.role}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Black Square Navigation Arrows matching Framer Reference */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous story"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-black hover:bg-[#FF5722] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={next}
                  aria-label="Next story"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-black hover:bg-[#FF5722] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Expansive Large Editorial Image Box */}
          <div className="lg:col-span-6 xl:col-span-7 w-full">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/10] xl:aspect-[16/9] min-h-[360px] sm:min-h-[440px] md:min-h-[520px] lg:min-h-[600px] rounded-2xl sm:rounded-3xl lg:rounded-[36px] overflow-hidden shadow-2xl bg-neutral-100 border border-neutral-200">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={currentStory.id}
                  src={currentStory.image}
                  alt={currentStory.author}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover object-center filter contrast-[1.03]"
                />
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};


