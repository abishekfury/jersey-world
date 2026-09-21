import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { IProduct } from '@shared/types';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleWishlist } from '../../store/wishlistSlice';
import { addToast } from '../../store/uiSlice';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: IProduct;
  index?: number;
  onQuickView?: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const dispatch = useAppDispatch();

  const wishlist = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
  const isOutOfStock = product.totalStock === 0;

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setIsQuickViewOpen(true);
    }
  };

  const frontImg = product.images?.front || (product as any).image;
  const backImg = product.images?.back;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.4, delay: (index % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col bg-white font-sans text-center select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Jersey Display Stage ── */}
        <div className="relative w-full aspect-[4/5] bg-transparent flex items-center justify-center overflow-hidden">
          {/* Top Badges */}
          <div className="absolute top-2 right-2 z-20 pointer-events-none">
            {isOutOfStock ? (
              <span className="text-xs font-semibold text-neutral-800 tracking-wider">
                Sold Out
              </span>
            ) : hasDiscount ? (
              <span className="px-2.5 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                Sale
              </span>
            ) : null}
          </div>

          {/* Wishlist Button (hover only) */}
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
            className="absolute top-2 left-2 z-20 p-2 text-neutral-600 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-[#FF5722] text-[#FF5722]' : 'text-neutral-600'
              }`}
            />
          </motion.button>

          {/* Main Jersey Image Link */}
          <Link
            to={`/shop/${product.slug || product._id}`}
            className="block w-full h-full p-4 flex items-center justify-center relative z-10"
          >
            <img
              src={isHovered && backImg ? backImg : frontImg}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`max-h-full max-w-full object-contain object-center transition-transform duration-500 ease-out ${
                isOutOfStock ? 'opacity-50' : 'group-hover:scale-105'
              }`}
            />
          </Link>

          {/* "Quick view" bottom bar button on hover */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
              <button
                type="button"
                onClick={handleQuickViewClick}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider text-center transition-colors"
              >
                Quick view
              </button>
            </div>
          )}
        </div>

        {/* ── Product Info (Centered) ── */}
        <div className="pt-4 pb-2 px-1 flex flex-col items-center justify-center space-y-1">
          {/* Title */}
          <Link
            to={`/shop/${product.slug || product._id}`}
            className="block text-xs sm:text-sm font-semibold uppercase tracking-wide text-neutral-900 hover:text-[#FF5722] transition-colors line-clamp-2 leading-relaxed"
          >
            {product.name}
          </Link>

          {/* Price */}
          <div className="flex items-center justify-center gap-2 pt-0.5 text-xs sm:text-sm font-medium">
            {hasDiscount ? (
              <>
                <span className="text-[#D32F2F] font-bold">
                  Rs. {effectivePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-neutral-400 line-through text-[11px] sm:text-xs">
                  Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              <span className="text-neutral-900 font-semibold">
                Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Internal Quick View Modal if not handled externally */}
      {!onQuickView && (
        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
};
