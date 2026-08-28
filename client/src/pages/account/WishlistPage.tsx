import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Trash2,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Flame,
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppSelector, useAppDispatch } from '../../store';
import { clearWishlist } from '../../store/wishlistSlice';
import { addLocalItem, toggleCartDrawer } from '../../store/cartSlice';
import { addToast } from '../../store/uiSlice';
import { ProductCard } from '../../components/product/ProductCard';
import { productService } from '../../services/api';
import { IProduct, JerseySize } from '@shared/types';

export const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const [recommendations, setRecommendations] = useState<IProduct[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Fetch trending recommendations
  useEffect(() => {
    setIsLoadingRecs(true);
    productService
      .getProducts({ limit: 4, isFeatured: true })
      .then((res) => {
        if (res.data?.products) {
          setRecommendations(res.data.products);
        }
      })
      .catch((err) => console.error('Error fetching recommendations:', err))
      .finally(() => setIsLoadingRecs(false));
  }, []);

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      dispatch(clearWishlist());
      dispatch(
        addToast({
          type: 'info',
          message: 'Wishlist cleared successfully',
        })
      );
    }
  };

  const handleAddAllToCart = () => {
    if (wishlist.length === 0) return;

    wishlist.forEach((product) => {
      // Pick first available size or default 'M'
      const defaultSize: JerseySize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'M';
      dispatch(
        addLocalItem({
          product,
          size: defaultSize,
          quantity: 1,
        })
      );
    });

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#FF5722', '#000000', '#FACC15'],
    });

    dispatch(
      addToast({
        type: 'success',
        message: `Added all ${wishlist.length} item(s) to your shopping bag!`,
      })
    );
    dispatch(toggleCartDrawer());
  };

  const handleShareWishlist = () => {
    navigator.clipboard.writeText(window.location.href);
    confetti({
      particleCount: 40,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#FF5722', '#171C1B'],
    });
    dispatch(
      addToast({
        type: 'success',
        message: 'Wishlist link copied to clipboard!',
      })
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#171C1B] font-sans pb-20">
      {/* Header Banner */}
      <div className="w-full bg-[#FAF9F5] border-b border-neutral-200 py-10 sm:py-14 px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
              >
                Home
              </Link>
              <span className="text-neutral-400 text-xs">/</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5722]">
                Wishlist
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-[#171C1B] tracking-tight uppercase font-display">
              SAVED MATCHWEAR
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
              {wishlist.length === 0
                ? 'Your personal curation of official club and international football kits.'
                : `You have ${wishlist.length} item${wishlist.length === 1 ? '' : 's'} saved in your wishlist.`}
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={handleShareWishlist}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-300 hover:border-black bg-white text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-black transition-all shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                onClick={handleClearWishlist}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-300 hover:border-red-400 hover:bg-red-50 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-red-600 transition-all shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>

              <button
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add All to Bag</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 pt-10 sm:pt-14">
        {wishlist.length > 0 ? (
          <div className="space-y-12">
            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <ProductCard product={product} index={idx} />
                </motion.div>
              ))}
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FAF9F5] border border-neutral-200/80">
                <Truck className="w-5 h-5 text-[#FF5722] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-black uppercase font-mono">Free Express Shipping</h4>
                  <p className="text-[11px] text-neutral-500">Across India on orders over ₹1,499</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FAF9F5] border border-neutral-200/80">
                <ShieldCheck className="w-5 h-5 text-[#FF5722] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-black uppercase font-mono">100% Authentic Kits</h4>
                  <p className="text-[11px] text-neutral-500">Official club badges & player-issue tags</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FAF9F5] border border-neutral-200/80">
                <RotateCcw className="w-5 h-5 text-[#FF5722] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-black uppercase font-mono">7-Day Size Exchange</h4>
                  <p className="text-[11px] text-neutral-500">Hassle-free replacement if fit differs</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 sm:py-20 text-center max-w-xl mx-auto space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#FAF9F5] border-2 border-neutral-200 flex items-center justify-center shadow-inner relative">
                <Heart className="w-10 h-10 text-neutral-400 fill-neutral-200/50" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#FF5722]/30 animate-ping pointer-events-none" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-normal text-[#171C1B] uppercase font-display tracking-tight">
                YOUR WISHLIST IS CURRENTLY EMPTY
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">
                You haven't saved any matchwear yet. Tap the heart icon on any jersey in our shop to save your favorite club kits and player editions.
              </p>
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
              <Link
                to="/shop"
                className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                All Matchwear
              </Link>
              <Link
                to="/shop?isBestSeller=true"
                className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                ★ Best Sellers
              </Link>
              <Link
                to="/shop?category=Club"
                className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Club Editions
              </Link>
              <Link
                to="/shop?category=International"
                className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                National Teams
              </Link>
            </div>

            <div className="pt-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-black hover:bg-[#FF5722] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md group"
              >
                <span>Explore Official Kits</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}

        {/* Recommended & Trending Showcase */}
        {recommendations.length > 0 && (
          <div className="mt-20 pt-12 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5722] uppercase font-mono tracking-widest mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>TRENDING RIGHT NOW</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-normal text-[#171C1B] uppercase font-display tracking-tight">
                  CURATED FOR YOU
                </h3>
              </div>
              <Link
                to="/shop"
                className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black hover:text-[#FF5722] transition-colors"
              >
                View Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
