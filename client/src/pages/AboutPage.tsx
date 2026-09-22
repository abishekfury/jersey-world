import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '../components/seo/SEO';

export const AboutPage: React.FC = () => {
  // Moving gallery images for "OUR MISSION" with organic Framer-style tilt angles
  const missionGallery = [
    {
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
      rotation: '-rotate-2',
    },
    {
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80',
      rotation: 'rotate-3',
    },
    {
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
      rotation: '-rotate-1',
    },
    {
      image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80',
      rotation: 'rotate-2',
    },
    {
      image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=600&q=80',
      rotation: '-rotate-3',
    },
    {
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      rotation: 'rotate-1',
    },
    {
      image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=600&q=80',
      rotation: '-rotate-2',
    },
    {
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
      rotation: 'rotate-2',
    },
  ];

  // Duplicate for seamless infinite marquee loop
  const marqueeItems = [...missionGallery, ...missionGallery];

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://jersey-world.vercel.app/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About Us',
        item: 'https://jersey-world.vercel.app/about'
      }
    ]
  };

  return (
    <div className="bg-white text-black min-h-screen">
      <SEO
        title="About Us — Heritage, Quality & Football Culture"
        description="Learn about Jersey World's mission to bring authentic football matchwear, retro kit heritage, and AI Virtual Fitting Room technology to fans worldwide."
        keywords="about jersey world, authentic football jersey store, football culture streetwear, premium soccer kits india"
        jsonLd={aboutJsonLd}
      />

      {/* 1. HERO SECTION (Original Warm Brown / Gold Gradient) */}
      <section className="relative w-full bg-gradient-to-b from-[#C89B6D] via-[#DDB892] to-[#B08968] text-white py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          {/* Left Large Title */}
          <div className="lg:col-span-4">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black font-display tracking-tight uppercase text-white leading-none">
              ABOUT US
            </h1>
          </div>

          {/* Center Model Visual */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-72 h-96 sm:w-80 sm:h-[440px] rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                alt="Jersey World Editorial Model"
                className="w-full h-full object-cover object-center filter contrast-105"
              />
            </div>
          </div>

          {/* Right Description Text */}
          <div className="lg:col-span-4 lg:pl-6 space-y-4">
            <p className="text-sm sm:text-base text-white/95 leading-relaxed font-medium">
              At Jersey World, we believe football culture and premium street fashion belong together—on the pitch, in the stands, and in daily streetwear. We curate authentic match kits, iconic retro classics, and official club collections built for the modern football devotee.
            </p>
          </div>
        </div>
      </section>

      {/* 2. OUR MISSION SECTION WITH MOVING MARQUEE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4 max-w-3xl">
          <h2 className="text-4xl sm:text-5xl font-black font-display uppercase tracking-tight text-black">
            OUR MISSION
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
            To empower football fans with authentic, verified jerseys that celebrate historic football moments, match-day pride, and everyday style. We deliver authentic player editions and retro archives at accessible prices—with groundbreaking 3D mannequin fitting.
          </p>
        </div>

        {/* Gallery Strip: Moving Horizontally with Tilted Images */}
        <div className="relative w-full overflow-hidden py-4 select-none">
          <div className="flex gap-4 sm:gap-6 animate-ticker-left w-max hover:[animation-play-state:paused] cursor-grab">
            {marqueeItems.map((item, idx) => (
              <div
                key={idx}
                className={`w-56 sm:w-64 md:w-72 aspect-square overflow-hidden bg-gray-100 border border-gray-200 shadow-md ${item.rotation} hover:rotate-0 hover:scale-105 transition-all duration-300 shrink-0`}
              >
                <img
                  src={item.image}
                  alt={`Jersey World Archive ${(idx % missionGallery.length) + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR CORE VALUES SECTION (Original Alignment + Scroll Pop-up Images) */}
      <section className="py-20 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div>
          <h2 className="text-4xl sm:text-5xl font-black font-display uppercase tracking-tight text-black">
            OUR CORE VALUES
          </h2>
        </div>

        {/* Value 1: AUTHENTICITY (Left Aligned, Title -> Pop-up Image -> Text) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-6 space-y-4">
            <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-black">
              100% MATCH AUTHENTICITY
            </h3>
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="aspect-square bg-gray-100 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80"
                alt="Authenticity"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
            <p className="text-xs text-gray-600 font-medium">
              Official heat-pressed crests, licensed breathable Dri-FIT/Aeroready fabrics, and verified authentic match numbers are non-negotiable.
            </p>
          </div>
        </div>

        {/* Value 2: PASSION & HERITAGE (Right Aligned, Title -> Pop-up Image -> Text) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-start-7 md:col-span-6 space-y-4">
            <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-black">
              PASSION & HERITAGE
            </h3>
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="aspect-[4/3] bg-gray-100 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80"
                alt="Football Heritage"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
            <p className="text-xs text-gray-600 font-medium">
              From the 1998 World Cup classics to Champions League finals, we preserve the legendary football moments that shaped sporting history.
            </p>
          </div>
        </div>

        {/* Value 3: GLOBAL FOOTBALL COMMUNITY (Left Aligned, Title -> Pop-up Image -> Text) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-6 space-y-4">
            <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-black">
              GLOBAL FOOTBALL COMMUNITY
            </h3>
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="aspect-square bg-gray-100 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
                alt="Community"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
            <p className="text-xs text-gray-600 font-medium">
              We connect supporters from the Santiago Bernabéu to the Maracanã. Wear your colors with pride.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
