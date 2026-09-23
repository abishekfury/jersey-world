import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ChevronLeft, ChevronRight, Check, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IProduct, JerseySize } from '@shared/types';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleWishlist } from '../../store/wishlistSlice';
import { addToCart, openCartDrawer } from '../../store/cartSlice';
import { addToast } from '../../store/uiSlice';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: IProduct;
  index?: number;
  onQuickView?: (product: IProduct) => void;
}

const DEFAULT_SIZES: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  // Available images list
  const availableImages = [
    product.images?.front || (product as any).image,
    product.images?.back,
    product.images?.detail,
  ].filter(Boolean) as string[];

  // Sizes logic
  const availableSizes: JerseySize[] =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : DEFAULT_SIZES;

  const [selectedSize, setSelectedSize] = useState<JerseySize>(
    availableSizes.length > 0 ? availableSizes[0] : 'M'
  );

  const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
  const discountPercent = hasDiscount ? Math.round(((product.price - effectivePrice) / product.price) * 100) : 0;
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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? availableImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === availableImages.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          product,
          size: selectedSize,
          quantity: 1,
        })
      );
      dispatch(openCartDrawer());
      setJustAdded(true);
      dispatch(
        addToast({
          type: 'success',
          message: `${product.name} (${selectedSize}) added to bag!`,
        })
      );
      setTimeout(() => setJustAdded(false), 2200);
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to add item to bag.' }));
    } finally {
      setIsAdding(false);
    }
  };

  const currentImg =
    availableImages.length > 0
      ? availableImages[activeImageIndex % availableImages.length]
      : '/images/image1.jpg';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.35, delay: (index % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col justify-between bg-white rounded-2xl border border-neutral-200/90 hover:border-black/25 overflow-hidden transition-all duration-300 hover:shadow-xl font-sans"
        onMouseEnter={() => {
          setIsHovered(true);
          if (availableImages.length > 1 && activeImageIndex === 0) {
            setActiveImageIndex(1); // Auto-show back view on hover
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setActiveImageIndex(0); // Reset to front view
        }}
      >
        {/* ── Top Image Stage (Aspect 4/5) ── */}
        <div className="relative w-full aspect-[4/5] bg-[#F7F7F6] overflow-hidden flex items-center justify-center">
          {/* Top-Left Badges (from Image 2) */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
            {isOutOfStock ? (
              <span className="px-2.5 py-1 bg-neutral-900/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-xs">
                Sold Out
              </span>
            ) : hasDiscount ? (
              <span className="px-2.5 py-1 bg-[#D32F2F] text-white text-[11px] font-black rounded-md shadow-sm tracking-tight">
                -{discountPercent}%
              </span>
            ) : product.type === 'Player Version' ? (
              <span className="px-2.5 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-xs">
                Player Issue
              </span>
            ) : null}
          </div>

          {/* Top-Right Floating Action Buttons (from Image 1 & 2) */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            {/* Wishlist Button */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dispatch(toggleWishlist(product));
                dispatch(
                  addToast({
                    type: 'info',
                    message: !isWishlisted
                      ? `Added ${product.name} to Wishlist!`
                      : `Removed from Wishlist`,
                  })
                );
              }}
              aria-label="Wishlist"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs border border-neutral-200/80 shadow-md flex items-center justify-center text-neutral-700 hover:text-[#FF5722] hover:border-[#FF5722]/30 transition-all cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWishlisted ? 'fill-[#FF5722] text-[#FF5722]' : 'text-neutral-700'
                }`}
              />
            </motion.button>

            {/* Quick View Button */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuickViewClick}
              aria-label="Quick View"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs border border-neutral-200/80 shadow-md flex items-center justify-center text-neutral-700 hover:text-black hover:border-black/40 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Product Image Link */}
          <Link
            to={`/shop/${product.slug || product._id}`}
            className="w-full h-full p-4 flex items-center justify-center"
          >
            <img
              src={currentImg}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`max-h-full max-w-full object-contain object-center transition-transform duration-500 ease-out ${
                isOutOfStock ? 'opacity-40 grayscale-[0.2]' : 'group-hover:scale-105'
              }`}
            />
          </Link>

          {/* Carousel Arrows on card (from Image 1) */}
          {availableImages.length > 1 && (
            <div className="absolute inset-x-2 bottom-3 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <button
                type="button"
                onClick={handlePrevImage}
                className="w-7 h-7 rounded-full bg-white/90 shadow-md border border-neutral-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors pointer-events-auto cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="w-7 h-7 rounded-full bg-white/90 shadow-md border border-neutral-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors pointer-events-auto cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick View Floating Pill Button on Hover (from Image 2) */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
              <button
                type="button"
                onClick={handleQuickViewClick}
                className="px-5 py-2 bg-white/95 hover:bg-white text-black text-xs font-bold rounded-full shadow-lg border border-neutral-200/90 transition-all transform group-hover:translate-y-0 translate-y-2 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Quick View</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Product Info & On-Card Action Controls ── */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-white">
          <div className="space-y-1.5">
            {/* Team / Category Subtitle */}
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              <span>{product.team || 'AUTHENTIC MATCHWEAR'}</span>
              <span>{product.season || '2026/27'}</span>
            </div>

            {/* Product Title */}
            <Link
              to={`/shop/${product.slug || product._id}`}
              className="block text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-tight group-hover:text-[#FF5722] transition-colors line-clamp-2 leading-snug"
              title={product.name}
            >
              {product.name}
            </Link>

            {/* Price Row (from Image 1 & 2) */}
            <div className="flex items-baseline gap-2 pt-0.5">
              {hasDiscount ? (
                <>
                  <span className="text-sm sm:text-base font-extrabold text-[#D32F2F]">
                    Rs. {effectivePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-neutral-400 line-through">
                    Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-base font-extrabold text-neutral-900">
                  Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>

          {/* Interactive In-Card Size Selector Pills (from Image 1) */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {DEFAULT_SIZES.map((sz) => {
                const isSelected = selectedSize === sz;
                const isAvailable = availableSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={!isAvailable || isOutOfStock}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[28px] h-7 px-1.5 text-[11px] font-bold rounded border transition-all cursor-pointer flex items-center justify-center font-mono ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-xs'
                        : isAvailable
                        ? 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                        : 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through cursor-not-allowed opacity-60'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Width "ADD TO CART" Button (from Image 1) */}
          <div className="pt-1">
            <button
              type="button"
              disabled={isOutOfStock || isAdding}
              onClick={handleAddToCart}
              className={`w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isOutOfStock
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-black hover:bg-[#FF5722] text-white active:scale-[0.98]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Added To Bag</span>
                </>
              ) : isAdding ? (
                <span>Adding...</span>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Add To Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Internal Quick View Modal */}
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
