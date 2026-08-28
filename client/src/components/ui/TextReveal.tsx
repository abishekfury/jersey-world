import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TextRevealProps {
  children: string;
  className?: string;
  mode?: 'words' | 'characters' | 'lines';
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  once?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className = '',
  mode = 'words',
  delay = 0,
  staggerDelay = 0.04,
  duration = 0.65,
  once = true,
  as: Component = 'div',
}) => {
  // Container variant managing the staggered reveal of child elements
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  // Item variant: slide up from below with smooth cubic-bezier easing
  const itemVariants: Variants = {
    hidden: {
      y: '120%',
      opacity: 0,
      rotateZ: 2,
    },
    visible: {
      y: '0%',
      opacity: 1,
      rotateZ: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1], // Apple / Framer smooth spring curve
      },
    },
  };

  if (mode === 'characters') {
    const words = children.split(' ');
    return (
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-50px' }}
        className={`inline-flex flex-wrap ${className}`}
      >
        {words.map((word, wIdx) => (
          <span key={wIdx} className="inline-flex whitespace-nowrap mr-[0.25em]">
            {word.split('').map((char, cIdx) => (
              <span key={cIdx} className="inline-block overflow-hidden py-0.5">
                <motion.span variants={itemVariants} className="inline-block">
                  {char}
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </motion.span>
    );
  }

  // Default: mode === 'words'
  const words = children.split(' ');

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      className={`inline-flex flex-wrap ${className}`}
    >
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden py-1 mr-[0.28em] align-top">
          <motion.span variants={itemVariants} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

