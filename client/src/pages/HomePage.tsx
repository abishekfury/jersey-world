import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Flame,
  Zap,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { productService } from '../services/api';
import { IProduct } from '@shared/types';
import { ProductCard } from '../components/product/ProductCard';
import { AnimatedTicker } from '../components/ui/AnimatedTicker';
import { InteractiveTiltCard } from '../components/ui/InteractiveTiltCard';
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
  const [trendingJerseys, setTrendingJerseys] = useState<IProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      productService.getProducts({ limit: 3, isBestSeller: true }),
      productService.getProducts({ limit: 4, isFeatured: true }),
      productService.getProducts({ limit: 4, isNewArrival: true }),
    ])
      .then(([bestRes, trendRes, newRes]) => {
        if (bestRes.status === 'fulfilled') {
          setBestSellers(bestRes.value.data.products || []);
        }
        if (trendRes.status === 'fulfilled') {
          setTrendingJerseys(trendRes.value.data.products || []);
        }
        if (newRes.status === 'fulfilled') {
          setNewArrivals(newRes.value.data.products || []);
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
        message: `Coupon "${code}" copied to clipboard! Enjoy 45% discount.`,
      })
    );
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  // Curated best selling products fallback
  const fallbackBestSellers = [
    {
      _id: 'real-madrid-seed-id',
      name: 'Real Madrid 2026/27 Royal White Edition',
      price: 5499,
      discountPrice: 4799,
      images: {
        front: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      },
      slug: 'real-madrid-2026-27-royal-white-edition',
    },
    {
      _id: 'barcelona-seed-id',
      name: 'Barcelona 2026/27 Blaugrana Heritage',
      price: 5299,
      discountPrice: 4599,
      images: {
        front: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      },
      slug: 'barcelona-2026-27-blaugrana-heritage',
    },
    {
      _id: 'arsenal-seed-id',
      name: 'Arsenal 2026/27 Emirates Red & White',
      price: 4999,
      discountPrice: 4299,
      images: {
        front: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
      },
      slug: 'arsenal-2026-27-emirates-red-white',
    },
  ];

  const displayBestSellers =
    bestSellers && bestSellers.length > 0 ? bestSellers : fallbackBestSellers;

  // Curated trending collection fallback
  const trendingShowcase = [
    {
      id: 'showcase-1',
      name: 'Vintage Brazil 1998',
      category: 'Retro Jerseys',
      price: 2299,
      image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=85',
      slug: 'vintage-brazil-1998',
    },
    {
      id: 'showcase-2',
      name: 'Dust Bowl Jersey',
      category: 'Jerseys',
      price: 1999,
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=85',
      slug: 'dust-bowl-jersey',
    },
    {
      id: 'showcase-3',
      name: 'After Hours Jersey',
      category: 'Jerseys',
      price: 1899,
      image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=85',
      slug: 'after-hours-jersey',
    },
    {
      id: 'showcase-4',
      name: 'Midnight Shift Jersey',
      category: 'Jerseys',
      price: 2199,
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=85',
      slug: 'midnight-shift-jersey',
    },
  ];

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

  const faqItems = [
    {
      id: 'faq-1',
      title: 'Are all jerseys 100% authentic and official match quality?',
      content:
        'Yes! Every jersey in our collection is crafted with authentic breathable moisture-wicking Dri-FIT / AEROREADY fabric, embroidered or heat-pressed club crests, and official sponsor detailing according to official match specifications.',
    },
    {
      id: 'faq-2',
      title: 'What is the difference between Fan Edition and Player Issue Version?',
      content:
        'Fan Edition jerseys offer a regular comfortable fit for daily casual wear, with woven patches. Player Issue versions feature an athletic slim cut, heat-applied rubberized badges, and ultra-lightweight laser-cut ventilation identical to what footballers wear on the pitch.',
    },
    {
      id: 'faq-3',
      title: 'Can I customize my jersey with player name, number, and badges?',
      content:
        'Absolutely! We offer official font printing for superstars like Bellingham, Mbappé, Messi, Ronaldo, Saka, and Yamal, as well as customized name and number printing with Champions League & Premier League sleeve badges.',
    },
    {
      id: 'faq-4',
      title: 'How long does shipping take across India and is there an exchange policy?',
      content:
        'Orders are dispatched within 24 hours. Metro deliveries take 2–4 business days, and other regions take 4–6 days. We provide a hassle-free 7-day size exchange policy if you need a different size.',
    },
  ];

  const marqueeKeywords = [
    'OFFICIAL 2026/27 MATCH KITS',
    'AUTHENTIC PLAYER GRADE ISSUE',
    'FREE EXPRESS INDIA SHIPPING OVER ₹1,499',
    'CUSTOM NAME & NUMBER PRINTING',
    'RETRO LEGENDS COLLECTION',
    '7-DAY HASSLE FREE SIZE EXCHANGE',
    'RATED 4.9/5 BY 50,000+ FANS',
  ];

  return (
    <div className="bg-white text-[#171C1B] min-h-screen selection:bg-[#FF5722] selection:text-white font-sans w-full overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="pt-8 sm:pt-12 pb-4 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="w-full text-left space-y-4"
        >
          {/* Top Live Badge */}
          <motion.div variants={wordItemVariants} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800">
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
              <span>NEW 2026/27 SEASON KITS NOW LIVE</span>
            </span>
          </motion.div>

          {/* Main Giant Headline */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[115px] xl:text-[138px] font-normal text-[#171C1B] tracking-tight uppercase leading-[0.88] w-full font-display flex flex-wrap items-baseline gap-x-4 sm:gap-x-6 gap-y-2">
            <motion.span variants={wordItemVariants} className="inline-block">
              EFFORTLESS
            </motion.span>
            <motion.span
              variants={wordItemVariants}
              className="inline-block text-[#FF5722] relative"
            >
              SHOPPING
            </motion.span>
            <motion.span variants={wordItemVariants} className="inline-block">
              EXCEPTIONAL
            </motion.span>
            <motion.span
              variants={wordItemVariants}
              className="inline-flex items-center gap-4 sm:gap-6 mt-1 sm:mt-2"
            >
              <span className="inline-block">CHOICES</span>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 border border-black bg-black text-white hover:bg-[#FF5722] hover:border-[#FF5722] font-semibold text-xs sm:text-sm font-sans tracking-normal transition-all duration-300 group shadow-md align-middle leading-none my-auto rounded-full"
              >
                Shop Now{' '}
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
              </Link>
            </motion.span>
          </h1>
        </motion.div>
      </section>

      {/* Full-Width Panoramic Lifestyle Hero Banner with Floating Overlay Badges */}
      <section className="w-full mt-6 sm:mt-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-[380px] sm:h-[500px] md:h-[620px] lg:h-[700px] overflow-hidden relative group"
        >
          <img
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=90"
            alt="Football and Streetwear Culture Matchwear"
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out filter contrast-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Floating Trust Pills in bottom corners */}
          <div className="absolute bottom-6 left-5 sm:left-10 z-20 flex flex-wrap items-center gap-3">
            <div className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-[#FF5722]" />
              <span className="text-xs font-bold text-black uppercase font-sans">
                Official Authenticity Guaranteed
              </span>
            </div>
            <div className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md hidden sm:flex">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-black font-sans">
                4.9/5 Rating (12,400+ Reviews)
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Infinite Marquee Ticker */}
      <div className="bg-black text-white py-2 border-y border-neutral-800">
        <AnimatedTicker
          items={marqueeKeywords}
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

      {/* 2. BEST SELLERS SECTION with 3D Tilt Cards */}
      <section className="py-12 sm:py-20 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        <div className="mb-8 sm:mb-12 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-[#FF5722] tracking-widest uppercase block mb-1 font-mono">
              ★ TOP PICKS 2026/27
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-normal text-[#171C1B] tracking-tight uppercase font-display">
              MOST POPULAR KITS
            </h2>
          </div>
          <Link
            to="/shop?isBestSeller=true"
            className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black hover:text-[#FF5722] flex items-center gap-1 group pb-1 font-sans"
          >
            Explore All <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {displayBestSellers.map((product, idx) => (
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
                      src={product.images?.front}
                      alt={product.name}
                      className="max-h-[88%] max-w-[88%] object-contain object-center transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-700 ease-out drop-shadow-md"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded">
                        Trending #{idx + 1}
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
      </section>

      {/* 3. TRENDING NOW SECTION */}
      <section className="py-10 sm:py-16 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 bg-[#FAF9F5] border-y border-neutral-200">
        <div className="mb-8 sm:mb-12 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-[#FF5722] tracking-widest uppercase block mb-1 font-mono">
              CURATED MATCHWEAR
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-normal text-[#171C1B] tracking-tight uppercase font-display">
              TRENDING NOW
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black hover:text-[#FF5722] flex items-center gap-1 group pb-1 font-sans"
          >
            View All <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {trendingJerseys && trendingJerseys.length > 0
            ? trendingJerseys.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} />
              ))
            : trendingShowcase.map((item, idx) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-transparent overflow-hidden transition-all duration-300"
                >
                  <div className="relative w-full aspect-[4/5] bg-white border border-neutral-200 rounded-lg overflow-hidden flex items-center justify-center p-6">
                    <Link to={`/shop`} className="block w-full h-full">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div className="pt-3.5 pb-1 space-y-0.5">
                    <Link
                      to="/shop"
                      className="block text-sm font-semibold text-black hover:text-[#FF5722] transition-colors font-sans"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-neutral-500 font-medium font-sans">
                      {item.category}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* 4. SALE IS ON / 45% OFF PROMO BANNER with 1-Click Copy & Confetti */}
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
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85"
                alt="Matchwear Sale Model Left"
                className="w-full max-w-[340px] h-[440px] object-cover object-top rounded-2xl shadow-xl filter contrast-105 hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Center Content Typography */}
            <div className="lg:col-span-4 text-center space-y-5 py-6 sm:py-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold tracking-widest uppercase font-sans">
                <Flame className="w-3.5 h-3.5 text-[#FF5722]" /> LIMITED SEASON OFFER
              </span>
              <h2 className="text-7xl sm:text-8xl lg:text-[116px] xl:text-[136px] font-normal text-black font-display tracking-tight uppercase leading-none">
                45% OFF
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 font-medium max-w-sm mx-auto leading-relaxed font-sans">
                Get an instant 45% discount on all matchwear & winter wear using the official promo code.
              </p>

              {/* Interactive Coupon Box with 1-Click Copy */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCopyCoupon('FABFIT25')}
                  className="px-5 py-3 bg-white border-2 border-dashed border-black rounded-xl flex items-center gap-2.5 font-mono text-sm font-bold text-black shadow-sm group hover:border-[#FF5722]"
                >
                  <span className="tracking-widest">#FABFIT25</span>
                  {copiedCoupon ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                  )}
                </motion.button>

                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black hover:bg-[#FF5722] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md font-sans"
                >
                  Shop Sale <ArrowUpRight className="w-4 h-4" />
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
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85"
                alt="Matchwear Sale Model Right"
                className="w-full max-w-[340px] h-[440px] object-cover object-top rounded-2xl shadow-xl filter contrast-105 hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW SEASON ARRIVALS SECTION */}
      <section className="py-12 sm:py-20 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        <div className="mb-8 sm:mb-12 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-[#FF5722] tracking-widest uppercase block mb-1 font-mono">
              2025 / 2026 EDITION
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-normal text-black tracking-tight uppercase font-display">
              NEW ARRIVALS
            </h2>
          </div>
          <Link
            to="/shop?isNewArrival=true"
            className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black hover:text-[#FF5722] flex items-center gap-1 group pb-1 font-sans"
          >
            View All <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {newArrivals && newArrivals.length > 0
            ? newArrivals.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} />
              ))
            : trendingShowcase.map((item, idx) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-transparent overflow-hidden transition-all duration-300"
                >
                  <div className="relative w-full aspect-[4/5] bg-white border border-neutral-200 rounded-lg overflow-hidden flex items-center justify-center p-6">
                    <Link to={`/shop`} className="block w-full h-full">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div className="pt-3.5 pb-1 space-y-0.5">
                    <Link
                      to="/shop"
                      className="block text-sm font-semibold text-[#171C1B] hover:text-[#FF5722] transition-colors font-sans"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-neutral-500 font-medium font-sans">
                      {item.category}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIALS SECTION */}
      <section className="py-16 sm:py-24 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 border-t border-neutral-200 bg-[#FAFAFA]">
        <div className="text-center mb-12 sm:mb-16 space-y-2">
          <span className="text-xs font-bold text-[#FF5722] uppercase tracking-widest font-mono">
            COMMUNITY & REVIEWS
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-normal text-black tracking-tight uppercase font-display">
            CUSTOMER TESTIMONIALS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium max-w-md mx-auto font-sans">
            Trusted by over 50,000+ football collectors, supporters, and jersey connoisseurs worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {testimonials.map((testi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white border border-neutral-200 p-6 sm:p-7 rounded-xl flex flex-col justify-between space-y-5 hover:border-black hover:shadow-lg transition-all duration-300 font-sans"
            >
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={testi.avatar}
                    alt={testi.name}
                    className="w-11 h-11 rounded-full object-cover border border-neutral-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-black">{testi.name}</h4>
                    <p className="text-[10px] text-neutral-400 font-medium">{testi.role}</p>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                  {testi.quote}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[#FACC15] pt-3 border-t border-neutral-100">
                {[...Array(testi.stars)].map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[#FACC15] text-[#FACC15]" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. INTERACTIVE FAQ ACCORDION SECTION */}
      <section className="py-16 sm:py-24 w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 border-t border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14 space-y-2">
            <span className="text-xs font-bold text-[#FF5722] uppercase tracking-widest font-mono">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-normal text-black tracking-tight uppercase font-display">
              GOT QUESTIONS? WE’VE GOT ANSWERS.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans">
              Learn about our jersey authenticity, size charts, customization, and express shipping.
            </p>
          </div>

          <Accordion items={faqItems} defaultOpenId="faq-1" />
        </div>
      </section>
    </div>
  );
};
