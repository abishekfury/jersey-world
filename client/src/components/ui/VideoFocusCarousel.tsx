import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollStreamProps {
  title?: string;
  badge?: string;
  subtitle?: string;
}

export const VideoFocusCarousel: React.FC<ScrollStreamProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [caption, setCaption] = useState('TRACY NEWYORK');

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      if (latest < 0.35) {
        setStage(1);
        setCaption('TRACY NEWYORK');
      } else if (latest < 0.70) {
        setStage(2);
        setCaption('GOALZA EDITION');
      } else {
        setStage(3);
        setCaption('MILAN HERITAGE');
      }
    });
  }, [scrollYProgress]);

  // Center image reveals (3 scroll stages total, smooth vertical slide-up reveals)
  // Stage 2 reveal (Alex Frankfurt / Goalza Edition)
  const reveal2Y = useTransform(scrollYProgress, [0.26, 0.44], ['100%', '0%']);
  // Stage 3 reveal (Milan Heritage)
  const reveal3Y = useTransform(scrollYProgress, [0.60, 0.78], ['100%', '0%']);

  // ================= STAGE 1 LOGOS (0% -> 36%) =================
  const s1Opacity = useTransform(scrollYProgress, [0, 0.28, 0.36], [1, 1, 0]);
  const s1Scale = useTransform(scrollYProgress, [0, 0.28, 0.36], [1, 1, 0.85]);

  // 1. Barcelona (Top-Left): gentle diagonal stream
  const barcaY = useTransform(scrollYProgress, [0, 0.36], [-10, 45]);
  const barcaX = useTransform(scrollYProgress, [0, 0.36], [-5, 15]);

  // 2. Real Madrid (Top-Right): gentle diagonal stream
  const realY = useTransform(scrollYProgress, [0, 0.36], [-10, 45]);
  const realX = useTransform(scrollYProgress, [0, 0.36], [5, -15]);

  // ================= STAGE 2 LOGOS (32% -> 72%) =================
  const s2Opacity = useTransform(scrollYProgress, [0.32, 0.40, 0.62, 0.70], [0, 1, 1, 0]);
  const s2Scale = useTransform(scrollYProgress, [0.32, 0.40, 0.62, 0.70], [0.85, 1, 1, 0.85]);

  // 3. Manchester United (Mid-Left): gentle float
  const utdY = useTransform(scrollYProgress, [0.32, 0.70], [30, -30]);
  const utdX = useTransform(scrollYProgress, [0.32, 0.70], [-10, 15]);

  // 4. Manchester City (Mid-Right): gentle float
  const cityY = useTransform(scrollYProgress, [0.32, 0.70], [30, -30]);
  const cityX = useTransform(scrollYProgress, [0.32, 0.70], [10, -15]);

  // 5. Bayern Munich (Bottom-Left): gentle rise
  const bayernY = useTransform(scrollYProgress, [0.32, 0.70], [25, -25]);
  const bayernX = useTransform(scrollYProgress, [0.32, 0.70], [-5, 15]);

  // ================= STAGE 3 LOGOS (65% -> 100%) =================
  const s3Opacity = useTransform(scrollYProgress, [0.66, 0.76, 1], [0, 1, 1]);
  const s3Scale = useTransform(scrollYProgress, [0.66, 0.76, 1], [0.85, 1, 1]);

  // 6. Inter Milan (Bottom-Right): gentle rise
  const interY = useTransform(scrollYProgress, [0.66, 1], [25, -25]);
  const interX = useTransform(scrollYProgress, [0.66, 1], [10, -15]);

  // 7. Borussia Dortmund (Top-Left): gentle drift
  const bvbY = useTransform(scrollYProgress, [0.66, 1], [-20, 30]);
  const bvbX = useTransform(scrollYProgress, [0.66, 1], [-5, 15]);

  // 8. AC Milan (Top-Right): gentle drift
  const milanY = useTransform(scrollYProgress, [0.66, 1], [-20, 30]);
  const milanX = useTransform(scrollYProgress, [0.66, 1], [10, -15]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white text-black min-h-[290vh] sm:min-h-[330vh] font-sans selection:bg-[#E9281F] selection:text-white"
    >
      {/* Sticky Fullscreen Canvas */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white px-4 select-none">

        {/* ----------------- STAGE 1 LOGOS ----------------- */}
        {/* Floating Club Icon 1: FC Barcelona (Stage 1 - Top Left) */}
        <motion.div
          style={{ x: barcaX, y: barcaY, opacity: s1Opacity, scale: s1Scale }}
          className={`absolute top-[4%] sm:top-[8%] left-[2%] sm:left-[6%] z-10 ${stage === 1 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link
            to="/shop?team=Barcelona"
            title="FC Barcelona Jerseys"
            className="w-14 h-14 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-xl sm:shadow-2xl border border-neutral-200/90 flex items-center justify-center p-2 sm:p-5 md:p-6 hover:scale-110 hover:shadow-2xl transition-all duration-300 block overflow-hidden"
          >
            <img
              src="/images/barcaicon.png"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.png')) target.src = target.src.replace('.png', '.jpg');
              }}
              alt="FC Barcelona"
              className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
              loading="lazy"
            />
          </Link>
        </motion.div>

        {/* Floating Club Icon 2: Real Madrid (Stage 1 - Top Right) */}
        <motion.div
          style={{ x: realX, y: realY, opacity: s1Opacity, scale: s1Scale }}
          className={`absolute top-[4%] sm:top-[8%] right-[2%] sm:right-[6%] z-10 ${stage === 1 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link
            to="/shop?team=Real+Madrid"
            title="Real Madrid Jerseys"
            className="w-14 h-14 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-xl sm:shadow-2xl border border-neutral-200/90 flex items-center justify-center p-2 sm:p-5 md:p-6 hover:scale-110 hover:shadow-2xl transition-all duration-300 block overflow-hidden"
          >
            <img
              src="/images/realicon.png"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.png')) target.src = target.src.replace('.png', '.jpg');
              }}
              alt="Real Madrid CF"
              className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
              loading="lazy"
            />
          </Link>
        </motion.div>


        {/* ----------------- STAGE 2 LOGOS ----------------- */}
        {/* Floating Club Icon 3: Manchester United (Stage 2 - Mid Left) */}
        <motion.div
          style={{ x: utdX, y: utdY, opacity: s2Opacity, scale: s2Scale }}
          className={`absolute top-[42%] sm:top-[42%] left-[2%] sm:left-[5%] z-10 ${stage === 2 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link
            to="/shop?team=Manchester+United"
            title="Manchester United Jerseys"
            className="w-14 h-14 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-xl sm:shadow-2xl border border-neutral-200/90 flex items-center justify-center p-2 sm:p-5 md:p-6 hover:scale-110 hover:shadow-2xl transition-all duration-300 block overflow-hidden"
          >
            <img
              src="/images/unitedicon.png"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.png')) target.src = target.src.replace('.png', '.jpg');
              }}
              alt="Manchester United"
              className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
              loading="lazy"
            />
          </Link>
        </motion.div>

        {/* Floating Club Icon 4: Manchester City (Stage 2 - Mid Right) */}
        <motion.div
          style={{ x: cityX, y: cityY, opacity: s2Opacity, scale: s2Scale }}
          className={`absolute top-[40%] sm:top-[40%] right-[2%] sm:right-[5%] z-10 ${stage === 2 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link
            to="/shop?team=Manchester+City"
            title="Manchester City Jerseys"
            className="w-14 h-14 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-xl sm:shadow-2xl border border-neutral-200/90 flex items-center justify-center p-2 sm:p-5 md:p-6 hover:scale-110 hover:shadow-2xl transition-all duration-300 block overflow-hidden"
          >
            <img
              src="/images/cityicon.png"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.png')) target.src = target.src.replace('.png', '.jpg');
              }}
              alt="Manchester City"
              className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
              loading="lazy"
            />
          </Link>
        </motion.div>

        {/* Floating Club Icon 5: Bayern Munich (Stage 2 - Bottom Left Corner) */}
        <motion.div
          style={{ x: bayernX, y: bayernY, opacity: s2Opacity, scale: s2Scale }}
          className={`absolute bottom-[3%] sm:bottom-[6%] left-[2%] sm:left-[6%] z-10 ${stage === 2 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link
            to="/shop?team=Bayern+Munich"
            title="Bayern Munich Jerseys"
            className="w-14 h-14 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-xl sm:shadow-2xl border border-neutral-200/90 flex items-center justify-center p-2 sm:p-5 md:p-6 hover:scale-110 hover:shadow-2xl transition-all duration-300 block overflow-hidden"
          >
            <img
              src="/images/bayernicon.jpg"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.jpg')) target.src = target.src.replace('.jpg', '.png');
              }}
              alt="Bayern Munich"
              className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
              loading="lazy"
            />
          </Link>
        </motion.div>


        {/* ----------------- STAGE 3 LOGOS ----------------- */}
        {/* Floating Club Icon 6: Inter Milan (Stage 3 - Bottom Right Corner) */}
        <motion.div
          style={{ x: interX, y: interY, opacity: s3Opacity, scale: s3Scale }}
          className={`absolute bottom-[3%] sm:bottom-[6%] right-[2%] sm:right-[6%] z-10 ${stage === 3 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link
            to="/shop?team=Inter+Milan"
            title="Inter Milan Jerseys"
            className="w-14 h-14 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-xl sm:shadow-2xl border border-neutral-200/90 flex items-center justify-center p-2 sm:p-5 md:p-6 hover:scale-110 hover:shadow-2xl transition-all duration-300 block overflow-hidden"
          >
            <img
              src="/images/intericon.png"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.png')) target.src = target.src.replace('.png', '.jpg');
              }}
              alt="Inter Milan"
              className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
              loading="lazy"
            />
          </Link>
        </motion.div>

        {/* Floating Club Icon 7: Borussia Dortmund (Stage 3 - Top Left Corner) */}
        <motion.div
          style={{ x: bvbX, y: bvbY, opacity: s3Opacity, scale: s3Scale }}
          className={`absolute top-[4%] sm:top-[8%] left-[2%] sm:left-[6%] z-10 ${stage === 3 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link
            to="/shop?team=Borussia+Dortmund"
            title="Borussia Dortmund Jerseys"
            className="w-14 h-14 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-xl sm:shadow-2xl border border-neutral-200/90 flex items-center justify-center p-2 sm:p-5 md:p-6 hover:scale-110 hover:shadow-2xl transition-all duration-300 block overflow-hidden"
          >
            <img
              src="/images/bvbicon.png"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.png')) target.src = target.src.replace('.png', '.jpg');
              }}
              alt="Borussia Dortmund"
              className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
              loading="lazy"
            />
          </Link>
        </motion.div>

        {/* Floating Club Icon 8: AC Milan (Stage 3 - Top Right Corner) */}
        <motion.div
          style={{ x: milanX, y: milanY, opacity: s3Opacity, scale: s3Scale }}
          className={`absolute top-[4%] sm:top-[8%] right-[2%] sm:right-[6%] z-10 ${stage === 3 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link
            to="/shop?team=AC+Milan"
            title="AC Milan Jerseys"
            className="w-14 h-14 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-white shadow-xl sm:shadow-2xl border border-neutral-200/90 flex items-center justify-center p-2 sm:p-5 md:p-6 hover:scale-110 hover:shadow-2xl transition-all duration-300 block overflow-hidden"
          >
            <img
              src="/images/acmilanicon.png"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.png')) target.src = target.src.replace('.png', '.jpg');
              }}
              alt="AC Milan"
              className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
              loading="lazy"
            />
          </Link>
        </motion.div>

        {/* Centerpiece Container (Matching sroll-stream.framer.website) */}
        <div className="relative z-20 flex flex-col items-center justify-center max-w-5xl mx-auto text-center px-4">
          
          {/* Main Central Portrait Photo with 3-Stage Reveal Layers (NO red line) */}
          <div className="relative w-[160px] xs:w-[190px] sm:w-[250px] md:w-[300px] lg:w-[330px] aspect-[3/4] overflow-hidden shadow-2xl bg-neutral-100 rounded-lg">
            {/* Stage 1 Base Image: Tracy Newyork */}
            <img
              src="/images/image8.jpg"
              onError={(e) => {
                e.currentTarget.src = '/images/image1.jpg';
              }}
              alt="Tracy Newyork Editorial"
              className="w-full h-full object-cover object-center"
            />

            {/* Stage 2 Sliding Reveal Layer: Alex Frankfurt / Goalza Edition */}
            <motion.div
              style={{ y: reveal2Y }}
              className="absolute inset-0 w-full h-full bg-white overflow-hidden"
            >
              <img
                src="/images/image9.jpg"
                onError={(e) => {
                  e.currentTarget.src = '/images/image2.jpg';
                }}
                alt="Alex Frankfurt Editorial"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>

            {/* Stage 3 Sliding Reveal Layer: Milan Heritage */}
            <motion.div
              style={{ y: reveal3Y }}
              className="absolute inset-0 w-full h-full bg-white overflow-hidden"
            >
              <img
                src="/images/image2.jpg"
                onError={(e) => {
                  e.currentTarget.src = '/images/image1.jpg';
                }}
                alt="Milan Heritage Editorial"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </div>

          {/* Red/Coral Location Tag matching sroll-stream */}
          <div className="mt-3 sm:mt-6 mb-2 sm:mb-3">
            <span className="text-[#E9281F] text-[11px] sm:text-xs font-sans tracking-[0.22em] uppercase font-bold">
              {caption}
            </span>
          </div>

          {/* Big Editorial Headline in Instrument Serif Italic matching sroll-stream */}
          <h2 className="font-serif italic font-normal tracking-tight text-black text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[108px] leading-[0.9] uppercase select-none">
            IMAGINE MORE
            <br />
            WITH US
          </h2>
        </div>

      </div>
    </div>
  );
};
