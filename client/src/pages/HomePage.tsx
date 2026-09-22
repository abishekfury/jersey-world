import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  Shirt,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { productService, bannerService } from '../services/api';
import { IProduct, IOfferBanner } from '@shared/types';
import { AnimatedTicker } from '../components/ui/AnimatedTicker';
import { CustomerReviewPill } from '../components/ui/CustomerReviewPill';
import { Accordion } from '../components/ui/Accordion';
import { useAppDispatch } from '../store';
import { addToast } from '../store/uiSlice';
import { SEO } from '../components/seo/SEO';

// Motion variants
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

interface AestheticSliderItem {
  id: string;
  title: string;
  image: string;
  link: string;
  subtitle?: string;
  badge?: string;
}

interface AestheticSliderProps {
  title: string;
  subtitle?: string;
  items: AestheticSliderItem[];
  allLink?: string;
  allText?: string;
}

const AestheticSlider: React.FC<AestheticSliderProps> = ({
  title,
  subtitle,
  items,
  allLink,
  allText = 'View All',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const onScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress(scrollLeft / maxScroll);
      }
    }
  };

  return (
    <section className="py-8 sm:py-12 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
      <div className="flex items-end justify-between mb-5 sm:mb-7">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-black font-display uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {allLink && (
          <Link
            to={allLink}
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors hidden sm:inline-flex items-center gap-1 font-sans"
          >
            <span>{allText}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 -mx-5 px-5 sm:-mx-8 sm:px-8 md:-mx-14 md:px-14 lg:-mx-16 lg:px-16 xl:-mx-20 xl:px-20"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className="group relative shrink-0 w-[220px] sm:w-[260px] md:w-[280px] lg:w-[calc(25%-15px)] aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-100 shadow-xs hover:shadow-xl transition-all duration-500"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none transition-opacity duration-300" />

            {item.badge && (
              <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                {item.badge}
              </span>
            )}

            <div className="absolute bottom-4 left-4 right-4 text-center">
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider drop-shadow-md">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-[11px] text-white/80 font-medium mt-0.5 drop-shadow-xs">
                  {item.subtitle}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Interactive Progress Line & Arrow Controls */}
      <div className="flex items-center justify-between pt-5 mt-2">
        <div className="h-[2px] w-40 sm:w-64 md:w-80 bg-neutral-200 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-black rounded-full transition-all duration-150"
            style={{ width: `${Math.max(25, scrollProgress * 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-9 h-9 rounded-full border border-neutral-300 hover:border-black hover:bg-black hover:text-white flex items-center justify-center transition-all duration-200 text-neutral-700 active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-9 h-9 rounded-full border border-neutral-300 hover:border-black hover:bg-black hover:text-white flex items-center justify-center transition-all duration-200 text-neutral-700 active:scale-95 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Dynamic Offer Banner State
  const [offerBanner, setOfferBanner] = useState<IOfferBanner>({
    badgeText: 'LIMITED SEASON OFFER',
    discountHeadline: '45% OFF',
    description: 'Get an instant 45% discount on all matchwear & winter wear using the official promo code.',
    couponCode: 'FABFIT25',
    buttonText: 'Shop Sale',
    buttonLink: '/shop',
    leftImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85',
    rightImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85',
    isActive: true,
    heroTag: 'OFFICIAL 2026/27 COLLECTION',
    heroHeadline: 'WEAR THE PASSION.',
    heroSubheadline: 'OWN THE GLORY.',
    heroDescription:
      'Discover authentic club & international jerseys with official badges, free express shipping, and seamless size exchanges.',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=85',
  });

  useEffect(() => {
    bannerService
      .getBanner()
      .then((bannerRes) => {
        if (bannerRes.data?.banner) {
          setOfferBanner((prev) => ({ ...prev, ...bannerRes.data.banner }));
        }
      })
      .catch(() => {});
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

  // 1. Categories Data
  const categories: AestheticSliderItem[] = [
    {
      id: 'cat-new-arrivals',
      title: 'NEW ARRIVALS',
      image: '/images/home/cat-new-arrivals.png',
      link: '/shop?isNewArrival=true',
      subtitle: '2026/27 Matchwear',
    },
    {
      id: 'cat-player-version',
      title: 'PLAYER VERSION',
      image: '/images/home/cat-player-version.png',
      link: '/shop?search=Player+Version',
      subtitle: 'Slim Fit & Heat Press',
    },
    {
      id: 'cat-retro-classics',
      title: 'RETRO CLASSICS',
      image: '/images/home/cat-retro-classics.png',
      link: '/shop?search=Retro',
      subtitle: 'Iconic 90s & 00s Kits',
    },
    {
      id: 'cat-national-team',
      title: 'NATIONAL TEAM',
      image: '/images/home/cat-national-team.png',
      link: '/shop?search=World+Cup',
      subtitle: 'World Cup Editions',
    },
  ];

  // 2. Clubs Data
  const clubs: AestheticSliderItem[] = [
    {
      id: 'club-barca',
      title: 'Barcelona',
      image: '/images/home/club-barcelona.png',
      link: '/shop?team=FC+Barcelona',
      badge: 'La Liga',
    },
    {
      id: 'club-real',
      title: 'Real Madrid',
      image: '/images/home/club-real-madrid.png',
      link: '/shop?team=Real+Madrid',
      badge: '15x UCL Champions',
    },
    {
      id: 'club-mufc',
      title: 'Manchester United',
      image: '/images/home/club-man-utd.png',
      link: '/shop?team=Manchester+United',
      badge: 'Premier League',
    },
    {
      id: 'club-mcfc',
      title: 'Manchester City',
      image: '/images/home/club-man-city.png',
      link: '/shop?team=Manchester+City',
      badge: 'Champions of England',
    },
  ];

  // 3. Players Data
  const players: AestheticSliderItem[] = [
    {
      id: 'player-messi',
      title: 'Lionel Messi',
      image: '/images/home/player-messi.png',
      link: '/shop?search=Messi',
      subtitle: 'World Champion #10',
    },
    {
      id: 'player-ronaldo',
      title: 'Cristiano Ronaldo',
      image: '/images/home/player-ronaldo.png',
      link: '/shop?search=Ronaldo',
      subtitle: 'CR7 • Portugal Legend',
    },
    {
      id: 'player-neymar',
      title: 'Neymar Jr',
      image: '/images/home/player-neymar.png',
      link: '/shop?search=Neymar',
      subtitle: 'Samba Magic #10',
    },
    {
      id: 'player-mbappe',
      title: 'Kylian Mbappé',
      image: '/images/home/player-mbappe.png',
      link: '/shop?search=Mbappe',
      subtitle: 'Real Madrid #9',
    },
  ];

  // 4. Curated Limited Drops
  const curatedDrops = [
    {
      id: 'germany-away',
      name: 'Germany 2026 World Cup Away Jersey (Fan Version)',
      image: '/images/home/drop-germany-away.png',
      link: '/shop?search=Germany',
      price: 999,
      originalPrice: 2999,
      badge: 'Sold out',
      isSoldOut: true,
    },
    {
      id: 'belgium-away',
      name: 'Belgium 2024 Away Set (With Blue Shorts)',
      image: '/images/home/drop-belgium-away.png',
      link: '/shop?search=Belgium',
      price: 999,
      originalPrice: 1999,
      badge: 'Sold out',
      isSoldOut: true,
      fromPrice: true,
    },
    {
      id: 'atletico-home',
      name: 'Atlético Madrid 2025/26 Home Jersey (Player Version)',
      image: '/images/home/drop-atletico-home.png',
      link: '/shop?search=Atletico',
      price: 999,
      originalPrice: 2999,
      badge: '-66%',
      isSoldOut: false,
      fromPrice: true,
    },
    {
      id: 'belgium-home',
      name: 'Belgium 2026 World Cup Home Jersey',
      image: '/images/home/drop-belgium-home.png',
      link: '/shop?search=Belgium',
      price: 999,
      originalPrice: 2999,
      badge: 'Sold out',
      isSoldOut: true,
    },
  ];

  const testimonials = [
    {
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Verified Buyer',
      quote: '"The player-version fabric quality is unreal. Authentic silicone badge and breathable side mesh panels."',
      stars: 5,
    },
    {
      name: 'Rohan Mehta',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Jersey Collector',
      quote: '"Ordered the Real Madrid home kit with BlueDart express. Delivered in 48 hours in pristine condition."',
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
      title: 'Are all jerseys 100% official and player-grade quality?',
      content:
        'Yes! Every jersey in our collection features authentic moisture-wicking Dri-FIT/Aeroready fabrics, official club badges, heat-pressed silicone crests, and authentic manufacturer tags. We strictly curate official replicas and player-issue editions.',
    },
    {
      id: 'faq-2',
      title: 'What payment methods do you accept?',
      content:
        'We accept 100% secure digital prepaid payments via Razorpay, including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), and Net Banking. All transactions are end-to-end encrypted with instant order confirmation.',
    },
    {
      id: 'faq-3',
      title: 'How fast is delivery across India?',
      content:
        'Orders are dispatched within 24 hours via express air couriers (BlueDart, Delhivery, DTDC). Metro cities receive delivery within 2-3 business days, while all other locations take 3-5 days. Tracking links are provided via SMS and email immediately.',
    },
    {
      id: 'faq-4',
      title: 'What is your size exchange policy?',
      content:
        'We offer a seamless 7-day hassle-free exchange policy. If your jersey does not fit perfectly, initiate an exchange from your account portal, and our courier partner will arrange a doorstep pickup.',
    },
  ];

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Jersey World',
      url: 'https://jersey-world.vercel.app',
      logo: 'https://jersey-world.vercel.app/logo.png',
      description: "India's premier destination for authentic football jerseys, iconic kits, retro collections, and AI Virtual Fitting Room technology.",
      sameAs: [
        'https://instagram.com/jerseyworld_in',
        'https://twitter.com/jerseyworld_in',
        'https://facebook.com/jerseyworld_in'
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
      name: 'Jersey World',
      url: 'https://jersey-world.vercel.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://jersey-world.vercel.app/shop?search={search_term_string}',
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
          {/* Panoramic Stadium & Lifestyle Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={offerBanner.heroBackgroundImage || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=85'}
              alt="Football Matchwear Stadium Atmosphere"
              className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-105"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Hero Top Bar: Tag & Season Indicator */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-mono tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
              <span>{offerBanner.heroTag || 'OFFICIAL 2026/27 COLLECTION'}</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 text-white/80 text-xs font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>AUTHENTIC MATCHWEAR • INDIA</span>
            </div>
          </div>

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
                'Discover authentic club & international jerseys with official badges, free express shipping, and seamless size exchanges.'}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
            >
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 bg-[#FF5722] hover:bg-[#e64a19] text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-full transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 group font-sans"
              >
                <span>EXPLORE ALL KITS</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
              </Link>

              <Link
                to="/try-on"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-full backdrop-blur-md border border-white/25 transition-all duration-300 font-sans"
              >
                <span>AI FITTING ROOM</span>
              </Link>
            </motion.div>
          </div>

          {/* Hero Bottom Trust & Google Reviews Card */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              <div className="h-[58px] sm:h-[62px] px-4 sm:px-5 rounded-2xl bg-[#18191B] border border-white/10 flex items-center gap-3 text-white shadow-xl">
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
              </div>

              <CustomerReviewPill
                rating="4.95"
                totalReviews="1K reviews"
                subtext="Trusted by 1000+ customers across India"
                variant="dark"
                className="h-[58px] sm:h-[62px]"
              />
            </div>

            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest hidden lg:inline-block">
              DELIVERING ACROSS INDIA 🇮🇳
            </span>
          </div>
        </div>
      </section>

      {/* Infinite Animated Marquee Ticker */}
      <div className="border-y border-neutral-200 bg-black text-white py-3.5 overflow-hidden">
        <AnimatedTicker
          items={[
            '★ OFFICIAL 2026/27 KITS',
            '⚡ 100% AUTHENTIC FABRIC',
            '🏆 PREMIER LEAGUE • LA LIGA • SERIE A',
            '🚚 EXPRESS 2-4 DAY DELIVERY IN INDIA',
            '✨ 7-DAY DOORSTEP SIZE EXCHANGE',
          ]}
          direction="left"
          speed={30}
          itemClassName="text-xs sm:text-sm font-display uppercase tracking-widest text-neutral-200"
        />
      </div>

      {/* Trust & Guarantee Badges */}
      <section className="border-b border-neutral-200 bg-[#FAF9F5] py-8 w-full">
        <div className="w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <motion.div
              whileHover={{ y: -3 }}
              className="flex items-center justify-center gap-3.5 p-2 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase text-black font-sans">
                  100% Authentic Match Kits
                </h4>
                <p className="text-[11px] text-neutral-500 font-medium font-sans">
                  Official club and national team apparel
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="flex items-center justify-center gap-3.5 p-2 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-xs">
                <Truck className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase text-black font-sans">
                  India-Wide Fast Shipping
                </h4>
                <p className="text-[11px] text-neutral-500 font-medium font-sans">
                  Free delivery on orders above ₹1,499
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="flex items-center justify-center gap-3.5 p-2 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-xs">
                <RotateCcw className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase text-black font-sans">
                  Easy 7-Day Exchange
                </h4>
                <p className="text-[11px] text-neutral-500 font-medium font-sans">
                  Hassle-free size replacement policy
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY SECTION */}
      <AestheticSlider
        title="Shop by Category"
        subtitle="Explore curated collections by jersey type and occasion"
        items={categories}
        allLink="/shop"
        allText="Browse All"
      />

      {/* 3. SHOP BY CLUBS SECTION */}
      <AestheticSlider
        title="Shop by Clubs"
        subtitle="Official kits from Europe's elite football giants"
        items={clubs}
        allLink="/shop"
        allText="All Clubs"
      />

      {/* 4. SHOP BY PLAYERS SECTION */}
      <AestheticSlider
        title="Shop by Players"
        subtitle="Honor the legends and rising stars of world football"
        items={players}
        allLink="/shop"
        allText="All Stars"
      />

      {/* 5. CURATED LIMITED DROPS (Only 4 kits, not 50 designs!) */}
      <section className="py-12 sm:py-16 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 bg-white">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF5722] font-bold">
              HANDPICKED ARCHIVES
            </span>
            <h2 className="text-2xl sm:text-4xl font-normal text-black font-display uppercase tracking-tight mt-1">
              Curated Drops
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black hover:text-[#FF5722] inline-flex items-center gap-1 font-sans transition-colors"
          >
            <span>View Full Catalog</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4-Card Boutique Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {curatedDrops.map((drop) => (
            <Link
              key={drop.id}
              to={drop.link}
              className="group flex flex-col bg-white rounded-3xl p-3 border border-neutral-200/80 hover:border-neutral-900 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
                <img
                  src={drop.image}
                  alt={drop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {drop.badge && (
                  <span
                    className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                      drop.badge === 'Sold out'
                        ? 'bg-neutral-900/90 text-white backdrop-blur-xs'
                        : 'bg-[#D32F2F] text-white'
                    }`}
                  >
                    {drop.badge}
                  </span>
                )}
              </div>
              <div className="pt-3 pb-1 px-1 space-y-1">
                <h4 className="text-xs sm:text-sm font-bold uppercase text-black line-clamp-1 group-hover:text-[#FF5722] transition-colors">
                  {drop.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#D32F2F] font-mono">
                    {drop.fromPrice ? 'From ' : ''}Rs. {drop.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {drop.originalPrice && (
                    <span className="text-[11px] text-neutral-400 line-through font-mono">
                      Rs. {drop.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 6. BARCELONA / MYSTERY SURPRISE JERSEY BANNER */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-6 sm:p-10 border border-neutral-800 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#D32F2F] text-[10px] font-bold font-mono tracking-widest uppercase">
              -76% SURPRISE DROP
            </span>
            <h3 className="text-2xl sm:text-4xl font-normal font-display uppercase tracking-tight leading-tight text-white">
              BARCELONA SURPRISE JERSEY
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              You won't know which one until you open it! Includes authentic home, away, or retro kits with official crests.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/shop?search=Barcelona"
                className="px-7 py-3 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#FF5722] hover:text-white transition-all shadow-lg"
              >
                Unbox Mystery Jersey
              </Link>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-mono text-emerald-400 font-bold">
                  Rs. 899.00
                </span>
                <span className="text-xs font-mono text-neutral-500 line-through">
                  Rs. 2,999.00
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full sm:w-72 aspect-[16/9] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <img
              src="/images/home/mystery-surprise-kit.png"
              alt="Barcelona Surprise Jersey"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 7. EDITORIAL SQUAD LOOKBOOK (Pitch Lifestyle Photo) */}
      <section className="py-10 sm:py-16 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 bg-[#FAF9F5] border-y border-neutral-200">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-neutral-300/80 group">
          <img
            src="/images/editorial-squad.jpg"
            alt="Jersey World Squad on Pitch"
            className="w-full h-auto max-h-[620px] object-cover object-center filter contrast-105 group-hover:scale-102 transition-transform duration-700 ease-out"
          />

          {/* Floating Jersey Feature Badge */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-white shadow-2xl max-w-[200px] hidden sm:block">
            <span className="text-[9px] font-mono tracking-widest text-[#FF5722] uppercase font-bold block">
              FEATURED KIT
            </span>
            <h5 className="text-xs font-bold uppercase mt-1">2026/27 Black Gold Edition</h5>
            <p className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">₹999.00</p>
          </div>

          {/* Bottom Editorial Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
            <span className="text-xs font-mono tracking-widest uppercase text-[#FF5722] font-bold">
              THE BEAUTIFUL GAME • 2026/27
            </span>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-normal font-display uppercase tracking-tight max-w-2xl mt-1">
              WORN ON PITCH. STYLED ON STREET.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mt-2">
              From European champions to iconic vintage heritage, discover jerseys crafted for genuine football culture.
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="px-7 py-3 bg-[#FF5722] hover:bg-[#e64a19] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg"
              >
                Shop The Lookbook
              </Link>
              <Link
                to="/try-on"
                className="px-7 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all"
              >
                AI Virtual Fitting Room
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SALE PROMO BANNER with 1-Click Copy */}
      {offerBanner.isActive && (
        <section className="py-16 sm:py-24 bg-[#ECEAE4] border-b border-neutral-300 w-full relative overflow-hidden">
          <div className="w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
              <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
                <motion.img
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  src={offerBanner.leftImage || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85'}
                  alt="Matchwear Sale Model Left"
                  className="w-full max-w-[340px] h-[440px] object-cover object-top rounded-2xl shadow-xl filter contrast-105 hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="lg:col-span-4 text-center space-y-5 py-6 sm:py-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold tracking-widest uppercase font-sans">
                  <Flame className="w-3.5 h-3.5 text-[#FF5722]" /> {offerBanner.badgeText}
                </span>
                <h2 className="text-7xl sm:text-8xl lg:text-[116px] xl:text-[136px] font-normal text-black font-display tracking-tight uppercase leading-none">
                  {offerBanner.discountHeadline}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-700 font-medium max-w-sm mx-auto leading-relaxed font-sans">
                  {offerBanner.description}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyCoupon(offerBanner.couponCode)}
                    className="px-5 py-3 bg-white border-2 border-dashed border-black rounded-xl flex items-center gap-2.5 font-mono text-sm font-bold text-black shadow-xs group hover:border-[#FF5722] cursor-pointer"
                  >
                    <span className="tracking-widest">#{offerBanner.couponCode}</span>
                    {copiedCoupon ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                    )}
                  </motion.button>

                  <Link
                    to={offerBanner.buttonLink || '/shop'}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black hover:bg-[#FF5722] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md font-sans"
                  >
                    {offerBanner.buttonText || 'Shop Sale'} <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
                <motion.img
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  src={offerBanner.rightImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85'}
                  alt="Matchwear Sale Model Right"
                  className="w-full max-w-[340px] h-[440px] object-cover object-top rounded-2xl shadow-xl filter contrast-105 hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. CUSTOMER TESTIMONIALS SECTION */}
      <section className="py-16 sm:py-24 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 border-t border-neutral-200 bg-[#FAFAFA]">
        <div className="text-center mb-12 sm:mb-16 space-y-3 flex flex-col items-center justify-center">
          <CustomerReviewPill
            variant="dark"
            rating="4.95"
            totalReviews="1K reviews"
            subtext="Trusted by 1000+ customers across India"
            className="shadow-xl"
          />
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-black font-display uppercase tracking-tight">
            WHAT COLLECTORS SAY
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium max-w-md mx-auto">
            Real feedback from passionate fans and football kit collectors across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white border border-neutral-200 p-6 rounded-2xl flex flex-col justify-between shadow-xs hover:border-black transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(test.stars)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-[#FF5722] fill-[#FF5722]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed italic">
                  {test.quote}
                </p>
              </div>

              <div className="pt-6 flex items-center gap-3 border-t border-neutral-100 mt-6">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                />
                <div>
                  <h5 className="text-xs font-bold uppercase text-black font-sans">{test.name}</h5>
                  <span className="text-[11px] text-neutral-500 font-medium block">
                    {test.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 10. INTERACTIVE FAQ ACCORDION SECTION */}
      <section className="py-16 sm:py-24 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 border-t border-neutral-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF5722] font-bold">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-5xl font-normal text-black font-display uppercase tracking-tight leading-tight">
              EVERYTHING YOU NEED TO KNOW.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
              Have questions regarding sizing, payment methods, authenticity, or shipping? Read our quick answers below.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:text-[#FF5722] transition-colors"
              >
                <span>Still have questions? Contact Support</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
};
