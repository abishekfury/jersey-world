import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IProduct } from '@shared/types';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleWishlist } from '../../store/wishlistSlice';
import { addToast } from '../../store/uiSlice';

interface ProductCardProps {
  product: IProduct;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();

  const wishlist = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.totalStock === 0;
  const isLowStock = !isOutOfStock && product.totalStock > 0 && product.totalStock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col bg-transparent font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Stage with Modern Framer Container ── */}
      <div
        className={`relative w-full aspect-[4/5] overflow-hidden flex items-center justify-center transition-all duration-500 border border-neutral-200/80 group-hover:border-black rounded-lg ${
          isOutOfStock ? 'bg-[#EBEBEB]' : 'bg-[#F2F2F0]'
        }`}
      >
        <Link to={`/shop/${product.slug || product._id}`} className="block w-full h-full p-6 sm:p-7 relative z-10">
          <img
            src={isHovered && product.images?.back ? product.images.back : product.images?.front}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-contain object-center transition-all duration-700 ease-out ${
              isOutOfStock ? 'opacity-40 grayscale' : 'group-hover:scale-110 group-hover:-translate-y-1'
            }`}
          />
        </Link>

        {/* ── Status Badges (top-left) ── */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {isOutOfStock && (
            <span className="px-2.5 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest font-sans rounded">
              Out of Stock
            </span>
          )}
          {!isOutOfStock && isLowStock && (
            <span className="px-2.5 py-1 bg-[#FF5722] text-white text-[9px] font-bold uppercase tracking-widest font-sans rounded animate-pulse">
              Low Stock
            </span>
          )}
          {!isOutOfStock && product.isNewArrival && (
            <span className="px-2.5 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest font-sans rounded">
              New
            </span>
          )}
          {!isOutOfStock && hasDiscount && (
            <span className="px-2.5 py-1 bg-[#FF5722] text-white text-[9px] font-bold uppercase tracking-widest font-sans rounded shadow-sm">
              -{discountPct}%
            </span>
          )}
          {!isOutOfStock && product.isBestSeller && !product.isNewArrival && !hasDiscount && (
            <span className="px-2.5 py-1 bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest font-sans rounded">
              Best Seller
            </span>
          )}
        </div>

        {/* ── Wishlist Button (top-right) ── */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch(toggleWishlist(product));
            dispatch(
              addToast({
                type: 'info',
                message: !isWishlisted ? `Added ${product.name} to Wishlist!` : `Removed from Wishlist`,
              })
            );
          }}
          aria-label="Toggle Wishlist"
          className="absolute top-3 right-3 z-20 p-2.5 bg-white/95 backdrop-blur-sm hover:bg-white text-black shadow-md rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#FF5722] text-[#FF5722]' : 'text-neutral-800'
            }`}
          />
        </motion.button>

        {/* ── Hover CTA Button Bar ── */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 z-20 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <Link
              to={`/shop/${product.slug || product._id}`}
              className="w-full py-3 bg-black text-white text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 hover:bg-[#FF5722] transition-colors rounded-md shadow-lg font-sans"
            >
              <span>View details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Product Info ── */}
      <div className="pt-3.5 pb-2 space-y-1">
        {/* Name */}
        <Link
          to={`/shop/${product.slug || product._id}`}
          className="block text-sm font-semibold text-black hover:text-[#FF5722] transition-colors line-clamp-1 font-sans leading-snug"
        >
          {product.name}
        </Link>

        {/* Category & Team */}
        <p className="text-xs text-neutral-400 font-medium font-sans">
          {product.type || product.team || 'Match Kit'}
        </p>

        {/* Price & Discount */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-bold text-black font-sans">
            ₹{effectivePrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through font-sans">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
