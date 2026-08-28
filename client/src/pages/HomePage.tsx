import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { productService, bannerService } from '../services/api';
import { IProduct, IOfferBanner } from '@shared/types';
import { AnimatedTicker } from '../components/ui/AnimatedTicker';
import { InteractiveTiltCard } from '../components/ui/InteractiveTiltCard';
import { InteractiveSplitHeading } from '../components/ui/InteractiveSplitHeading';
import { CustomerReviewPill } from '../components/ui/CustomerReviewPill';
import { Accordion } from '../components/ui/Accordion';
import { useAppDispatch } from '../store';
import { addToast } from '../store/uiSlice';

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
  const [bestSellers, setBestSellers] = useState<IProduct[]>([]);
  const [newSeasonJerseys, setNewSeasonJerseys] = useState<IProduct[]>([]);
  const [premierLeagueJerseys, setPremierLeagueJerseys] = useState<IProduct[]>([]);
  const [laLigaJerseys, setLaLigaJerseys] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  });

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      productService.getProducts({ limit: 3, isBestSeller: true }),
      productService.getProducts({ limit: 3, isNewArrival: true }),
      productService.getProducts({ limit: 3, league: 'Premier League' }),
      productService.getProducts({ limit: 3, league: 'La Liga' }),
      bannerService.getBanner(),
    ])
      .then(([bestRes, newRes, eplRes, laligaRes, bannerRes]) => {
        if (bestRes.status === 'fulfilled') {
          setBestSellers(bestRes.value.data.products || []);
        }
        if (newRes.status === 'fulfilled') {
          setNewSeasonJerseys(newRes.value.data.products || []);
        }
        if (eplRes.status === 'fulfilled') {
          setPremierLeagueJerseys(eplRes.value.data.products || []);
        }
        if (laligaRes.status === 'fulfilled') {
          setLaLigaJerseys(laligaRes.value.data.products || []);
        }
        if (bannerRes.status === 'fulfilled' && bannerRes.value.data?.banner) {
          setOfferBanner(bannerRes.value.data.banner);
        }
      })
      .catch((err) => console.error('Error loading home products:', err))
      .finally(() => setIsLoading(false));
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

  // Fallbacks with full product model
  const fallbackBestSellers: IProduct[] = [
    {
      _id: 'real-madrid-seed-id',
      name: 'Real Madrid 2026/27 Royal White Edition',
      price: 5499,
      discountPrice: 4799,
      images: {
        front: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      },
      slug: 'real-madrid-2026-27-royal-white-edition',
    } as IProduct,
    {
      _id: 'barcelona-seed-id',
      name: 'Barcelona 2026/27 Blaugrana Heritage',
      price: 5299,
      discountPrice: 4599,
      images: {
        front: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      },
      slug: 'barcelona-2026-27-blaugrana-heritage',
    } as IProduct,
    {
      _id: 'arsenal-seed-id',
      name: 'Arsenal 2026/27 Emirates Red & White',
      price: 4999,
      discountPrice: 4299,
      images: {
        front: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
      },
      slug: 'arsenal-2026-27-emirates-red-white',
    } as IProduct,
  ];

  const fallbackNewSeason: IProduct[] = [
    {
      _id: 'ns-1',
      name: 'Real Madrid 2026/27 Royal White Edition',
      price: 5499,
      discountPrice: 4799,
      images: {
        front: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'real-madrid-2026-27-royal-white-edition',
    } as IProduct,
    {
      _id: 'ns-2',
      name: 'Manchester City 2026/27 Sky Blue Home',
      price: 4999,
      discountPrice: 4399,
      images: {
        front: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'manchester-city-2026-27-sky-blue-home',
    } as IProduct,
    {
      _id: 'ns-3',
      name: 'Arsenal 2026/27 Emirates Red & White',
      price: 4999,
      discountPrice: 4299,
      images: {
        front: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'arsenal-2026-27-emirates-red-white',
    } as IProduct,
  ];

  const fallbackPremierLeague: IProduct[] = [
    {
      _id: 'epl-1',
      name: 'Manchester City 2026/27 Sky Blue Home',
      price: 4999,
      discountPrice: 4399,
      images: {
        front: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'manchester-city-2026-27-sky-blue-home',
    } as IProduct,
    {
      _id: 'epl-2',
      name: 'Arsenal 2026/27 Emirates Red & White',
      price: 4999,
      discountPrice: 4299,
      images: {
        front: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'arsenal-2026-27-emirates-red-white',
    } as IProduct,
    {
      _id: 'epl-3',
      name: 'Liverpool 2026/27 Anfield Crimson',
      price: 4899,
      discountPrice: 4199,
      images: {
        front: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'liverpool-2026-27-anfield-crimson',
    } as IProduct,
  ];

  const fallbackLaLiga: IProduct[] = [
    {
      _id: 'laliga-1',
      name: 'Real Madrid 2026/27 Royal White Edition',
      price: 5499,
      discountPrice: 4799,
      images: {
        front: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'real-madrid-2026-27-royal-white-edition',
    } as IProduct,
    {
      _id: 'laliga-2',
      name: 'Barcelona 2026/27 Blaugrana Heritage',
      price: 5299,
      discountPrice: 4599,
      images: {
        front: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'barcelona-2026-27-blaugrana-heritage',
    } as IProduct,
    {
      _id: 'laliga-3',
      name: 'Real Madrid 2026/27 Away Gold Edition',
      price: 5399,
      discountPrice: 4699,
      images: {
        front: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=85',
      },
      slug: 'real-madrid-2026-27-away-gold-edition',
    } as IProduct,
  ];

  const displayBestSellers =
    bestSellers && bestSellers.length >= 3 ? bestSellers.slice(0, 3) : fallbackBestSellers;
  const displayNewSeason =
    newSeasonJerseys && newSeasonJerseys.length >= 3 ? newSeasonJerseys.slice(0, 3) : fallbackNewSeason;
  const displayPremierLeague =
    premierLeagueJerseys && premierLeagueJerseys.length >= 3 ? premierLeagueJerseys.slice(0, 3) : fallbackPremierLeague;
  const displayLaLiga =
    laLigaJerseys && laLigaJerseys.length >= 3 ? laLigaJerseys.slice(0, 3) : fallbackLaLiga;

  // Reusable 3D Tilt Card Grid Component for all product sections
  const renderProductTrio = (items: IProduct[], badgePrefix: string) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {items.map((product, idx) => (
        <motion.div
          key={product._id || idx}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.15 }}
        >
          <InteractiveTiltCard maxTilt={6} className="h-full">
            <Link
              to={`/shop/${product.slug || product._id}`}
              className="group block bg-white border border-neutral-200/90 overflow-hidden hover:border-black transition-all duration-500 shadow-sm rounded-xl h-full flex flex-col justify-between"
            >
              {/* 3D Product Canvas Area */}
              <div className="w-full h-[380px] sm:h-[420px] lg:h-[460px] bg-[#F5F5F3] flex items-center justify-center p-8 overflow-hidden relative">
                <img
                  src={product.images?.front || (product as any).image}
                  alt={product.name}
                  className="max-h-[88%] max-w-[88%] object-contain object-center transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-700 ease-out drop-shadow-md"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-xs">
                    {badgePrefix} #{idx + 1}
                  </span>
                </div>
              </div>

              {/* Bottom Title Bar */}
              <div className="border-t border-neutral-200 group-hover:border-black px-6 py-5 flex items-center justify-between bg-white group-hover:bg-black transition-all duration-300">
                <div>
                  <h3 className="text-xl sm:text-2xl font-normal text-[#171C1B] group-hover:text-white uppercase font-display tracking-tight transition-colors duration-300 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs font-mono text-neutral-500 group-hover:text-neutral-300 mt-0.5">
                    ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-black group-hover:text-white transform group-hover:rotate-45 group-hover:translate-x-1 transition-all duration-300 w-10 h-10 rounded-full border border-neutral-200 group-hover:border-white/30 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-5 h-5 stroke-[1.8]" />
                </div>
              </div>
            </Link>
          </InteractiveTiltCard>
        </motion.div>
      ))}
    </div>
  );

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
      quote: '"Super fast delivery across India. The custom player printing on the back looks crisp and professional."',
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
      title: 'Can I customize my jersey with any player name and number?',
      content:
        'Absolutely! We offer official league and cup font heat-transfer printing for any player name (e.g. BELLINGHAM 5, MESSI 10, MBAPPÉ 9, CR7) or your own custom name and number.',
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

  return (
    <div className="bg-white text-black min-h-screen font-sans selection:bg-black selection:text-white">
      {/* 1. HERO SECTION (Full Width Edge-to-Edge) */}
      <section className="w-full relative overflow-hidden bg-neutral-950 border-b border-neutral-800">
        <div className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] xl:min-h-[800px] flex flex-col justify-between px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 py-8 sm:py-12 md:py-14 lg:py-16">
          {/* Panoramic Stadium & Lifestyle Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=85"
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
              <span>OFFICIAL 2026/27 COLLECTION</span>
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
                  WEAR THE PASSION<span className="text-[#FF5722]">.</span>
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h2
                  variants={wordItemVariants}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-neutral-300 uppercase font-display tracking-tight leading-[0.95]"
                >
                  OWN THE GLORY.
                </motion.h2>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-sm sm:text-base md:text-lg text-neutral-200 font-normal max-w-xl leading-relaxed"
            >
              Discover authentic club & international jerseys with official custom name & number printing, free express shipping, and seamless size exchanges.
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
                <span>SHOP ALL JERSEYS</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
              </Link>

              <Link
                to="/shop?isBestSeller=true"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-full backdrop-blur-md border border-white/25 transition-all duration-300 font-sans"
              >
                <span>POPULAR KITS</span>
              </Link>
            </motion.div>
          </div>

          {/* Hero Bottom Trust & Google Reviews Card */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              {/* Authenticity Pill with matching height and 2-line structure */}
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

              {/* Exact Google Reviews Card from Image 2 */}
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
            '🔥 CUSTOM NAME & NUMBER PRINTING',
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

      {/* 2. MOST POPULAR KITS (3 Cards) */}
      <section className="py-12 sm:py-20 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        <div className="mb-10 sm:mb-14 flex flex-col items-center justify-center text-center">
          <InteractiveSplitHeading
            prefix="MOST POPULAR"
            suffix="KITS"
            tagline="★ TOP PICKS 2026/27"
            badge="BEST SELLER"
            images={[
              'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=85',
              'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=85',
              'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=85',
            ]}
          />
          <Link
            to="/shop?isBestSeller=true"
            className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-600 hover:text-[#FF5722] inline-flex items-center gap-1.5 group font-sans transition-colors"
          >
            Explore All Matchwear <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
          </Link>
        </div>

        {renderProductTrio(displayBestSellers, 'Trending')}
      </section>

      {/* 3. NEW SEASON 26 / 27 SECTION (3 Cards) */}
      <section className="py-12 sm:py-20 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 bg-[#FAF9F5] border-y border-neutral-200">
        <div className="mb-10 sm:mb-14 flex flex-col items-center justify-center text-center">
          <InteractiveSplitHeading
            prefix="NEW SEASON"
            suffix="26 / 27"
            tagline="2026 / 2027 CLUB & INTERNATIONAL"
            badge="OFFICIAL DROP"
            images={[
              'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=85',
              'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=85',
              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=85',
            ]}
          />
          <Link
            to="/shop?isNewArrival=true"
            className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-600 hover:text-[#FF5722] inline-flex items-center gap-1.5 group font-sans transition-colors"
          >
            View All 2026/27 Season Kits <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
          </Link>
        </div>

        {renderProductTrio(displayNewSeason, '2026/27')}
      </section>

      {/* 4. PREMIER LEAGUE SECTION (3 Cards) */}
      <section className="py-12 sm:py-20 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 bg-white border-b border-neutral-200">
        <div className="mb-10 sm:mb-14 flex flex-col items-center justify-center text-center">
          <InteractiveSplitHeading
            prefix="PREMIER"
            suffix="LEAGUE"
            tagline="ENGLISH TOP FLIGHT"
            badge="EPL KITS"
            images={[
              'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=85',
              'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=85',
              'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=85',
            ]}
          />
          <Link
            to="/shop?league=Premier+League"
            className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-600 hover:text-[#FF5722] inline-flex items-center gap-1.5 group font-sans transition-colors"
          >
            View All Premier League Kits <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
          </Link>
        </div>

        {renderProductTrio(displayPremierLeague, 'EPL')}
      </section>

      {/* 5. SALE IS ON / DYNAMIC OFFER BANNER with 1-Click Copy & Confetti */}
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
                  src={offerBanner.leftImage || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85'}
                  alt="Matchwear Sale Model Left"
                  className="w-full max-w-[340px] h-[440px] object-cover object-top rounded-2xl shadow-xl filter contrast-105 hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Center Content Typography */}
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

                {/* Interactive Coupon Box with 1-Click Copy */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
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

                  <Link
                    to={offerBanner.buttonLink || '/shop'}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black hover:bg-[#FF5722] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md font-sans"
                  >
                    {offerBanner.buttonText || 'Shop Sale'} <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Model */}
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

      {/* 6. LA LIGA SECTION (3 Cards) */}
      <section className="py-12 sm:py-20 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 bg-white">
        <div className="mb-10 sm:mb-14 flex flex-col items-center justify-center text-center">
          <InteractiveSplitHeading
            prefix="LA"
            suffix="LIGA"
            tagline="SPANISH FOOTBALL EXCELLENCE"
            badge="PRIMERA DIVISIÓN"
            images={[
              'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=85',
              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=85',
              'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=85',
            ]}
          />
          <Link
            to="/shop?league=La+Liga"
            className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-600 hover:text-[#FF5722] inline-flex items-center gap-1.5 group font-sans transition-colors"
          >
            View All La Liga Kits <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
          </Link>
        </div>

        {renderProductTrio(displayLaLiga, 'La Liga')}
      </section>

      {/* 7. CUSTOMER TESTIMONIALS SECTION */}
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

      {/* 8. INTERACTIVE FAQ ACCORDION SECTION */}
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
              Have questions regarding sizing, custom heat-transfer printing, authenticity, or shipping? Read our quick answers below.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
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
