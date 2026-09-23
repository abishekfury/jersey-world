import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { bannerService } from '../services/api';
import { IOfferBanner } from '@shared/types';
import { AnimatedTicker } from '../components/ui/AnimatedTicker';
import { CustomerReviewPill } from '../components/ui/CustomerReviewPill';
import { Accordion } from '../components/ui/Accordion';
import { VideoFocusCarousel } from '../components/ui/VideoFocusCarousel';
import { PremiumTestimonial } from '../components/ui/PremiumTestimonial';
import { useAppDispatch } from '../store';
import { addToast } from '../store/uiSlice';
import { SEO } from '../components/seo/SEO';

interface CardItem {
  name: string;
  image: string;
  link: string;
  objectPosition?: string;
}

// Editorial Clubs configuration
const CLUBS: CardItem[] = [
  {
    name: 'Barcelona',
    image: '/images/barcelona.jpg',
    link: '/shop?team=Barcelona',
  },
  {
    name: 'Real Madrid',
    image: '/images/real_madrid.jpg',
    link: '/shop?team=Real+Madrid',
  },
  {
    name: 'Manchester United',
    image: '/images/manchesterunited.jpg',
    link: '/shop?team=Manchester+United',
  },
  {
    name: 'Manchester City',
    image: '/images/manchestercity.jpg',
    link: '/shop?team=Manchester+City',
  },
  {
    name: 'Liverpool',
    image: '/images/liverpool.jpg',
    link: '/shop?team=Liverpool',
  },
];

// Shop by Players configuration (order: messi, ronaldo, neymar, haaland, mbappe, yamal)
const PLAYERS: CardItem[] = [
  {
    name: 'Messi',
    image: '/images/messi.jpg?v=3',
    link: '/shop?search=Messi',
    objectPosition: 'object-[center_48%]',
  },
  {
    name: 'Ronaldo',
    image: '/images/ronaldo.jpg',
    link: '/shop?search=Ronaldo',
    objectPosition: 'object-bottom',
  },
  {
    name: 'Neymar',
    image: '/images/neymar.jpg',
    link: '/shop?search=Neymar',
    objectPosition: 'object-[center_60%]',
  },
  {
    name: 'Haaland',
    image: '/images/haaland.jpg',
    link: '/shop?search=Haaland',
    objectPosition: 'object-bottom',
  },
  {
    name: 'Mbappé',
    image: '/images/mbappe.jpg',
    link: '/shop?search=Mbappe',
    objectPosition: 'object-[center_35%]',
  },
  {
    name: 'Yamal',
    image: '/images/yamal.png',
    link: '/shop?search=Yamal',
    objectPosition: 'object-[center_30%]',
  },
];

// National Teams configuration (order: argentina, brazil, france, portugal, spain)
const NATIONAL_TEAMS: CardItem[] = [
  {
    name: 'Argentina',
    image: '/images/argentina.jpg',
    link: '/shop?country=Argentina',
  },
  {
    name: 'Brazil',
    image: '/images/brazil.jpg',
    link: '/shop?country=Brazil',
  },
  {
    name: 'France',
    image: '/images/france.jpg',
    link: '/shop?country=France',
  },
  {
    name: 'Portugal',
    image: '/images/portugal.jpg',
    link: '/shop?country=Portugal',
  },
  {
    name: 'Spain',
    image: '/images/spain.jpg',
    link: '/shop?country=Spain',
  },
];

// Reusable card slider section component matching editorial reference
const CardSliderSection: React.FC<{
  title: string;
  items: CardItem[];
  bgClass?: string;
  aspectClass?: string;
}> = ({ title, items, bgClass = 'bg-white', aspectClass = 'aspect-[4/5]' }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 1) {
      setScrollRatio(0);
    } else {
      setScrollRatio(Math.min(1, Math.max(0, scrollLeft / maxScroll)));
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className={`py-12 sm:py-16 md:py-20 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 ${bgClass}`}
    >
      {/* Header with Title in Black Box (Hover Shimmer & Lift Animation) and Controls */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <motion.div
          whileHover={{ scale: 1.04, y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="relative group inline-flex items-center justify-center bg-black text-white px-7 sm:px-12 py-3.5 sm:py-4.5 rounded-2xl min-h-[56px] sm:min-h-[66px] shadow-lg border border-black hover:border-neutral-700 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_18px_35px_rgba(0,0,0,0.35)] select-none"
        >
          {/* Shimmer Light Beam Effect across the button on hover */}
          <div className="absolute inset-0 -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Top Glass Highlight Reflection */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Subtle Ambient Radial Highlight on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_75%)] pointer-events-none" />

          {/* Kinetic Text Rollover: Text goes UP and clone rolls UP from below on hover */}
          <div className="relative z-10 overflow-hidden flex flex-col items-center justify-center h-7 sm:h-8 md:h-9">
            <span className="block text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider font-sans text-white transition-transform duration-350 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full whitespace-nowrap drop-shadow-sm select-none">
              {title}
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider font-sans text-white transition-transform duration-350 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-full group-hover:translate-y-0 whitespace-nowrap drop-shadow-sm select-none">
              {title}
            </span>
          </div>
        </motion.div>
        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            aria-label={`Previous ${title}`}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-800 transition-all cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            aria-label={`Next ${title}`}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-800 transition-all cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-5 h-5 stroke-[1.8]" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal Slider Row */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-5 px-5 sm:-mx-8 sm:px-8 md:-mx-14 md:px-14 lg:-mx-16 lg:px-16 xl:-mx-20 xl:px-20"
      >
        {items.map((item) => (
          <Link
            key={item.name}
            to={item.link}
            className={`group relative flex-shrink-0 w-[75vw] max-w-[280px] min-w-[240px] sm:w-[calc(50%-12px)] sm:min-w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] md:min-w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] lg:min-w-[calc(25%-18px)] ${aspectClass} rounded-2xl overflow-hidden bg-neutral-100 block transition-all duration-500 hover:shadow-xl hover:-translate-y-2`}
          >
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${
                item.objectPosition || 'object-center'
              }`}
              loading="lazy"
            />
            {/* Bottom Subtle Gradient for crisp text contrast */}
            <div className="absolute inset-x-0 bottom-0 pt-16 pb-5 sm:pb-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-center pointer-events-none rounded-b-2xl">
              <span className="text-white text-sm sm:text-base font-medium tracking-normal text-center drop-shadow-sm font-sans transition-transform duration-300 group-hover:translate-y-[-2px]">
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Progress Bar & Navigation Arrows */}
      <div className="mt-8 sm:mt-10 flex items-center justify-between gap-6">
        {/* Horizontal Track with Active Indicator */}
        <div className="relative flex-1 h-[2px] bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 h-full bg-neutral-900 rounded-full transition-all duration-150 ease-out"
            style={{
              width: '35%',
              left: `${scrollRatio * (100 - 35)}%`,
            }}
          />
        </div>

        {/* Bottom Navigation Arrows */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => scroll('left')}
            aria-label={`Previous ${title}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-800 transition-all cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => scroll('right')}
            aria-label={`Next ${title}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-800 transition-all cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-5 h-5 stroke-[1.5]" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

// Motion variants matching Framer site entrance animations
const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const wordItemVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Dynamic Offer Banner State with image1, image2, and image3
  const [offerBanner, setOfferBanner] = useState<IOfferBanner>({
    badgeText: 'LIMITED SEASON OFFER',
    discountHeadline: '45% OFF',
    description: 'Get an instant 45% discount on all matchwear & winter wear using the official promo code.',
    couponCode: 'FABFIT25',
    buttonText: 'Shop Sale',
    buttonLink: '/shop',
    leftImage: '/images/image2.jpg',
    rightImage: '/images/image3.jpg',
    isActive: true,
    heroTag: 'OFFICIAL 2026/27 COLLECTION',
    heroHeadline: 'WEAR THE PASSION.',
    heroSubheadline: 'OWN THE GLORY.',
    heroDescription:
      'Discover authentic club & international jerseys with official badges, free shipping only above ₹1,499, and seamless size exchanges.',
    heroBackgroundImage: '/images/image1.jpg',
  });

  useEffect(() => {
    bannerService
      .getBanner()
      .then((bannerRes) => {
        if (bannerRes.data?.banner) {
          setOfferBanner((prev) => ({ ...prev, ...bannerRes.data.banner }));
        }
      })
      .catch((err) => console.error('Error loading banner:', err));
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF5722', '#000000', '#FACC15', '#FFFFFF'],
    });
    dispatch(
      addToast({
        type: 'success',
        message: `Coupon "${code}" copied to clipboard!`,
      })
    );
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const testimonials = [
    {
      name: 'Rohan Kapoor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Verified Matchwear Collector',
      quote: '"The Real Madrid player edition fabric is 100% authentic. The sizing guide and fabric quality are top tier!"',
      stars: 5,
    },
    {
      name: 'Aanay Mehta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Verified Football Enthusiast',
      quote: '"Bought the 1998 Brazil retro jersey. The stitching, collar details, and badges are true to the original final kit."',
      stars: 5,
    },
    {
      name: 'Sofia Martinez',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      role: 'Verified Buyer',
      quote: '"Super fast delivery across India. The jersey fabric and stitching look crisp and professional."',
      stars: 5,
    },
    {
      name: 'Emily Carter',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      role: 'Verified Buyer',
      quote: '"Great collection of international and club jerseys. Excellent customer service and packaging."',
      stars: 5,
    },
  ];

  const faqs = [
    {
      id: 'faq-1',
      title: 'What is your return policy?',
      content:
        'We offer a seamless 7-day hassle-free exchange and return policy. If your jersey does not fit perfectly, initiate an exchange from your account portal, and our courier partner will arrange a doorstep pickup.',
    },
    {
      id: 'faq-2',
      title: 'How long does shipping take?',
      content:
        'Orders are dispatched within 24 hours via express couriers (BlueDart, Delhivery, DTDC). Metro deliveries arrive in 2-3 business days, while all other locations take 3-5 days. Tracking links are provided via SMS and email immediately.',
    },
    {
      id: 'faq-3',
      title: 'How can I choose the right size?',
      content:
        'We recommend ordering your standard athletic shirt size for Fan versions. For Player Version kits, we recommend sizing up by one size for a comfortable fit. You can also consult our detailed size guide on every product page.',
    },
    {
      id: 'faq-4',
      title: 'Are all jerseys 100% official and player-grade quality?',
      content:
        'Yes! Every jersey in our collection features authentic moisture-wicking Dri-FIT/Aeroready fabrics, official club badges, heat-pressed silicone crests, and authentic manufacturer tags. We strictly curate official replicas and player-issue editions.',
    },
    {
      id: 'faq-5',
      title: 'What payment methods do you accept?',
      content:
        'We accept 100% secure digital prepaid payments via Razorpay, including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), and Net Banking. All transactions are end-to-end encrypted with instant order confirmation.',
    },
  ];

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'GOALZA',
      url: 'https://goalza.vercel.app',
      logo: 'https://goalza.vercel.app/logo.png',
      description: 'India\'s premier destination for authentic football jerseys, iconic kits, retro collections, and AI Virtual Fitting Room technology.',
      sameAs: [
        'https://instagram.com/goalza_in',
        'https://twitter.com/goalza_in',
        'https://facebook.com/goalza_in'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi']
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'GOALZA',
      url: 'https://goalza.vercel.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://goalza.vercel.app/shop?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  ];

  return (
    <div className="bg-white text-black min-h-screen font-sans selection:bg-black selection:text-white">
      <SEO
        title="Authentic Football Jerseys & AI Fitting Room"
        description="Shop authentic football club & national team jerseys. Iconic retro kits, player editions, and AI Virtual Fitting Room experience with fast shipping across India."
        keywords="football jerseys, authentic soccer kits, real madrid jersey, barcelona kit, arsenal jersey, manchester united kit, retro football shirts, AI virtual fitting room"
        jsonLd={homeJsonLd}
      />
      {/* 1. HERO SECTION (Full Width Edge-to-Edge) */}
      <section className="w-full relative overflow-hidden bg-neutral-950 border-b border-neutral-800">
        <div className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] xl:min-h-[800px] flex flex-col justify-between px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 py-8 sm:py-12 md:py-14 lg:py-16">
          {/* Panoramic Stadium & Lifestyle Backdrop Image with subtle continuous zoom */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.img
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              src="/images/image1.jpg"
              onError={(e) => {
                if (offerBanner.heroBackgroundImage && !offerBanner.heroBackgroundImage.includes('photo-1522778119026')) {
                  e.currentTarget.src = offerBanner.heroBackgroundImage;
                }
              }}
              alt="GOALZA Matchwear Atmosphere"
              className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-105"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Hero Top Bar: Tag & Season Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex items-center justify-between"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-mono tracking-widest uppercase shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
              <span>{offerBanner.heroTag || 'OFFICIAL 2026/27 COLLECTION'}</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 text-white/80 text-xs font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>AUTHENTIC MATCHWEAR • INDIA</span>
            </div>
          </motion.div>

          {/* Hero Central Typography & Call-To-Actions */}
          <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6 my-auto py-8 sm:py-10">
            <motion.div
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-1 sm:space-y-2"
            >
              <div className="overflow-hidden">
                <motion.h1
                  variants={wordItemVariants}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-white uppercase font-display tracking-tight leading-[0.95]"
                >
                  {offerBanner.heroHeadline || 'WEAR THE PASSION.'}
                </motion.h1>
              </div>
              {offerBanner.heroSubheadline && (
                <div className="overflow-hidden">
                  <motion.h2
                    variants={wordItemVariants}
                    className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-neutral-300 uppercase font-display tracking-tight leading-[0.95]"
                  >
                    {offerBanner.heroSubheadline}
                  </motion.h2>
                </div>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-sm sm:text-base md:text-lg text-neutral-200 font-normal max-w-xl leading-relaxed"
            >
              {offerBanner.heroDescription ||
                'Discover authentic club & international jerseys with official badges, free shipping only above ₹1,499, and seamless size exchanges.'}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 bg-[#FF5722] hover:bg-[#e64a19] text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-full transition-all duration-300 shadow-xl group font-sans"
                >
                  <span>SHOP ALL JERSEYS</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/shop?isBestSeller=true"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-full backdrop-blur-md border border-white/25 transition-all duration-300 font-sans shadow-md"
                >
                  <span>POPULAR KITS</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Bottom Trust & Google Reviews Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15"
          >
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              {/* Authenticity Pill with matching height and 2-line structure */}
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="h-[58px] sm:h-[62px] px-4 sm:px-5 rounded-2xl bg-[#18191B] border border-white/10 flex items-center gap-3 text-white shadow-xl cursor-default"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#FF5722]" />
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider font-sans whitespace-nowrap text-white leading-tight">
                    Official Authenticity
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium leading-tight mt-0.5 whitespace-nowrap">
                    100% Genuine Matchwear
                  </span>
                </div>
              </motion.div>

              {/* Exact Google Reviews Card from Image 2 */}
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CustomerReviewPill
                  rating="4.95"
                  totalReviews="1K reviews"
                  subtext="Trusted by 1000+ customers across India"
                  variant="dark"
                  className="h-[58px] sm:h-[62px] cursor-default"
                />
              </motion.div>
            </div>

            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest hidden lg:inline-block">
              DELIVERING ACROSS INDIA 🇮🇳
            </span>
          </motion.div>
        </div>
      </section>

      {/* Infinite Animated Marquee Ticker */}
      <div className="border-y border-neutral-200 bg-black text-white py-3.5 overflow-hidden">
        <AnimatedTicker
          items={[
            '★ OFFICIAL 2026/27 KITS',
            '⚡ 100% AUTHENTIC FABRIC',
            '🔥 OFFICIAL MATCHDAY PLAYER KITS',
            '🚚 FREE SHIPPING ONLY ON ORDERS ABOVE ₹1,499',
            '🏆 PREMIER LEAGUE • LA LIGA • SERIE A',
            '⚡ EXPRESS 2-4 DAY DELIVERY ACROSS INDIA',
            '✨ 7-DAY DOORSTEP SIZE EXCHANGE',
          ]}
          direction="left"
          speed={30}
          itemClassName="text-xs sm:text-sm font-display uppercase tracking-widest text-neutral-200"
        />
      </div>

      {/* Trust & Value Proposition Pillars (Reference Image Design with Smooth Hover and Scroll Animations) */}
      <section className="border-b border-neutral-200 bg-white py-14 sm:py-20 w-full font-sans overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-14 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
            {/* 1. Authentic Match Kits Pillar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: 0.05 }}
              whileHover={{ y: -6 }}
              className="flex flex-col items-center text-center px-6 sm:px-10 py-8 md:py-4 group cursor-default"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-5 flex items-center justify-center text-black group-hover:scale-110 group-hover:text-[#FF5722] transition-all duration-300">
                <svg
                  className="w-14 h-14 sm:w-16 sm:h-16"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Subtle 4-point sparkle accents */}
                  <path d="M12 14l1.5-3 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" strokeWidth="1.2" />
                  <path d="M50 14l1.5-3 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" strokeWidth="1.2" />
                  {/* Scalloped rosette seal */}
                  <path d="M32 10c2.5 0 4.7 1.3 5.9 3.3 2.5-.3 4.9.6 6.3 2.5 1.5 1.9 1.7 4.5.5 6.6 2.1 1.3 3.3 3.6 3 6.1-.3 2.5-2 4.5-4.3 5.1.4 2.5-.5 5.1-2.4 6.5-1.9 1.5-4.6 1.5-6.6.3-1.3 2.1-3.6 3.4-6.1 3.4s-4.8-1.3-6.1-3.4c-2 1.2-4.7 1.2-6.6-.3-1.9-1.4-2.8-4-2.4-6.5-2.3-.6-4-2.6-4.3-5.1-.3-2.5.9-4.8 3-6.1-1.2-2.1-1-4.7.5-6.6 1.4-1.9 3.8-2.8 6.3-2.5 1.2-2 3.4-3.3 5.9-3.3z" />
                  {/* Center Checkmark */}
                  <path d="M25 29l5 5 10-10" strokeWidth="2.8" />
                  {/* Bottom ribbon tails */}
                  <path d="M23 41l-5 13 9-4 5 6" />
                  <path d="M41 41l5 13-9-4-5 6" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider text-black font-sans group-hover:text-[#FF5722] transition-colors duration-300">
                100% Authentic Match Kits
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans mt-2 max-w-xs leading-relaxed">
                Official club and national team apparel
              </p>
            </motion.div>

            {/* 2. Fast Dispatch / Shipping Pillar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -6 }}
              className="flex flex-col items-center text-center px-6 sm:px-10 py-8 md:py-4 group cursor-default"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-5 flex items-center justify-center text-black group-hover:scale-110 group-hover:text-[#FF5722] transition-all duration-300">
                <svg
                  className="w-14 h-14 sm:w-16 sm:h-16"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Motion speed lines on left */}
                  <path d="M4 22h10M7 30h8M4 38h10" />
                  {/* 3D Isometric Shipping Box */}
                  <path d="M22 20l18-9 16 8-18 9-16-8z" />
                  <path d="M22 20v21l18 10V30" />
                  <path d="M56 26.5v8" />
                  <path d="M40 30l16-8.5" />
                  {/* Seams / Tape */}
                  <path d="M31 15.5l9 4.5" />
                  <path d="M31 36v10" />
                  {/* Circular Checkmark Badge */}
                  <circle cx="46" cy="44" r="9" fill="white" stroke="currentColor" strokeWidth="2" />
                  <path d="M42 44l3 3 6-6" strokeWidth="2.8" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider text-black font-sans group-hover:text-[#FF5722] transition-colors duration-300">
                India-Wide Fast Shipping
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans mt-2 max-w-xs leading-relaxed">
                Free delivery only on orders above ₹1,499
              </p>
            </motion.div>

            {/* 3. Easy 7-Day Exchange / Quality Shield Pillar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: 0.25 }}
              whileHover={{ y: -6 }}
              className="flex flex-col items-center text-center px-6 sm:px-10 py-8 md:py-4 group cursor-default"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mb-5 flex items-center justify-center text-black group-hover:scale-110 group-hover:text-[#FF5722] transition-all duration-300">
                <svg
                  className="w-14 h-14 sm:w-16 sm:h-16"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Top radiance bursts */}
                  <path d="M32 6v6M22 10l3 5M42 10l-3 5" />
                  {/* Shield outline */}
                  <path d="M16 19c0 0 8-3 16-3s16 3 16 3v16c0 11-10 19-16 22-6-3-16-11-16-22V19z" />
                  {/* Center Checkmark */}
                  <path d="M25 33l5 5 10-10" strokeWidth="2.8" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider text-black font-sans group-hover:text-[#FF5722] transition-colors duration-300">
                Easy 7-Day Exchange
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans mt-2 max-w-xs leading-relaxed">
                Hassle-free size replacement policy
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CLUBS SECTION */}
      <CardSliderSection title="Shop by Clubs" items={CLUBS} bgClass="bg-white border-t border-neutral-200" />

      {/* 3. SHOP BY PLAYERS SECTION (Increased Height for Full Player Visibility) */}
      <CardSliderSection
        title="Shop by Players"
        items={PLAYERS}
        bgClass="bg-[#FAF9F5] border-t border-neutral-200"
        aspectClass="aspect-[9/15] sm:aspect-[9/14] md:aspect-[9/13] min-h-[460px] sm:min-h-[500px] md:min-h-[540px]"
      />

      {/* 4. NATIONAL TEAMS SECTION */}
      <CardSliderSection title="Shop by National Teams" items={NATIONAL_TEAMS} bgClass="bg-white border-t border-neutral-200" />

      {/* 5. SCROLL STREAM EDITORIAL SECTION (Matching sroll-stream.framer.website) */}
      <VideoFocusCarousel />

      {/* 6. WHY GOALZA HERO BANNER & BRAND STATEMENT (Full Width Edge-to-Edge & Expansive Height) */}
      <section className="w-full bg-white border-t border-neutral-200 overflow-hidden">
        {/* Full-bleed Edge-to-Edge Banner Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full relative overflow-hidden bg-neutral-950"
        >
          <img
            src="/images/banner1.png"
            alt="WHY GOALZA - Wear The Game"
            className="w-full h-auto min-h-[500px] sm:min-h-[680px] md:min-h-[840px] lg:min-h-[980px] object-cover object-top filter contrast-105 hover:scale-102 transition-transform duration-700"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 py-12 sm:py-16 md:py-20 text-center space-y-4"
        >
          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal text-black font-display uppercase tracking-tight leading-none">
            WHY GOALZA?
          </h2>
          <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-base md:text-lg text-black font-bold uppercase tracking-[0.25em] font-sans">
            <motion.span whileHover={{ scale: 1.1, color: '#FF5722' }} className="transition-colors cursor-default">QUALITY</motion.span>
            <span className="text-[#FF5722] font-normal">|</span>
            <motion.span whileHover={{ scale: 1.1, color: '#FF5722' }} className="transition-colors cursor-default">FIT</motion.span>
            <span className="text-[#FF5722] font-normal">|</span>
            <motion.span whileHover={{ scale: 1.1, color: '#FF5722' }} className="transition-colors cursor-default">PRICE</motion.span>
          </div>
        </motion.div>
      </section>

      {/* 7. SALE IS ON / DYNAMIC OFFER BANNER with 1-Click Copy & Confetti */}
      {offerBanner.isActive && (
        <section className="py-16 sm:py-24 bg-[#ECEAE4] border-b border-neutral-300 w-full relative overflow-hidden">
          <div className="w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
              {/* Left Model */}
              <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
                <motion.img
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  src={offerBanner.leftImage || '/images/image2.jpg'}
                  alt="Matchwear Sale Model Left"
                  className="w-full max-w-[340px] h-[440px] object-cover object-top rounded-2xl shadow-xl filter contrast-105 hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Center Content Typography */}
              <div className="lg:col-span-4 text-center space-y-5 py-6 sm:py-10">
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold tracking-widest uppercase font-sans shadow-md"
                >
                  <Flame className="w-3.5 h-3.5 text-[#FF5722]" /> {offerBanner.badgeText}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-7xl sm:text-8xl lg:text-[116px] xl:text-[136px] font-normal text-black font-display tracking-tight uppercase leading-none"
                >
                  {offerBanner.discountHeadline}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="text-xs sm:text-sm text-neutral-700 font-medium max-w-sm mx-auto leading-relaxed font-sans"
                >
                  {offerBanner.description}
                </motion.p>

                {/* Interactive Coupon Box with 1-Click Copy */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyCoupon(offerBanner.couponCode)}
                    className="px-5 py-3 bg-white border-2 border-dashed border-black rounded-xl flex items-center gap-2.5 font-mono text-sm font-bold text-black shadow-sm group hover:border-[#FF5722] cursor-pointer"
                  >
                    <span className="tracking-widest">#{offerBanner.couponCode}</span>
                    {copiedCoupon ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                    )}
                  </motion.button>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={offerBanner.buttonLink || '/shop'}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black hover:bg-[#FF5722] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md font-sans"
                    >
                      {offerBanner.buttonText || 'Shop Sale'} <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right Model */}
              <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
                <motion.img
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  src={offerBanner.rightImage || '/images/image3.jpg'}
                  alt="Matchwear Sale Model Right"
                  className="w-full max-w-[340px] h-[440px] object-cover object-top rounded-2xl shadow-xl filter contrast-105 hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. INTERACTIVE FAQ SECTION WITH IMAGE 9 (Matching Reference 2) */}
      <section className="py-16 sm:py-24 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 border-t border-neutral-200 bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-7xl mx-auto">
          {/* Left Column: Image 9 Card with smooth whileInView */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 w-full flex justify-center"
          >
            <div className="w-full max-w-[540px] aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-neutral-200 group bg-neutral-100">
              <img
                src="/images/image9.jpg"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('image8.jpg')) {
                    target.src = '/images/image8.jpg';
                  }
                }}
                alt="GOALZA Community"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </motion.div>

          {/* Right Column: FAQs Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-2 mb-6 sm:mb-8">
              <span className="text-xs sm:text-sm italic font-serif text-neutral-500 block">
                FAQs
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic text-black tracking-tight font-sans">
                Your Questions, Answered
              </h2>
            </div>

            <Accordion
              items={faqs}
              iconVariant="plus"
              titleClassName="text-sm sm:text-base italic font-semibold text-neutral-900 group-hover:text-[#FF5722] transition-colors font-sans"
            />

            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-[#FF5722] transition-colors group"
              >
                <span>Still have questions? Contact Support</span>
                <ArrowUpRight className="w-4 h-4 text-[#FF5722] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. PREMIUM EDITORIAL CLIENT STORIES (Matching premiumtestimonial.framer.website reference) */}
      <PremiumTestimonial />
    </div>
  );
};
