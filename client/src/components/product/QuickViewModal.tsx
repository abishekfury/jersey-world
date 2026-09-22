import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, ArrowRight, Sparkles, Check } from 'lucide-react';
import { IProduct, JerseySize } from '@shared/types';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart, addLocalItem, openCartDrawer } from '../../store/cartSlice';
import { toggleWishlist } from '../../store/wishlistSlice';
import { addToast } from '../../store/uiSlice';

interface QuickViewModalProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_SIZES: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlist = useAppSelector((state) => state.wishlist.items);

  const [selectedSize, setSelectedSize] = useState<JerseySize>('M');
  const [selectedImage, setSelectedImage] = useState<'front' | 'back'>('front');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize('M');
      setSelectedImage('front');
      setQuantity(1);
    }
  }, [product]);

  if (!product || !isOpen) return null;

  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
  const isOutOfStock = product.totalStock === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);

    try {
      if (isAuthenticated) {
        await dispatch(
          addToCart({
            productId: product._id,
            product,
            size: selectedSize,
            quantity,
          })
        ).unwrap();
      } else {
        dispatch(
          addLocalItem({
            product,
            size: selectedSize,
            quantity,
          })
        );
      }

      dispatch(
        addToast({
          type: 'success',
          message: `Added ${product.name} (${selectedSize}) to cart!`,
        })
      );
      dispatch(openCartDrawer());
      onClose();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          message: 'Failed to add item to cart.',
        })
      );
    } finally {
      setIsAdding(false);
    }
  };

  const frontImg = product.images?.front || (product as any).image;
  const backImg = product.images?.back;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Images */}
          <div className="w-full md:w-1/2 bg-[#F9F9F9] p-6 sm:p-8 flex flex-col items-center justify-between relative border-b md:border-b-0 md:border-r border-neutral-100">
            {/* Sale / Stock Badge */}
            <div className="absolute top-4 left-4 z-10">
              {isOutOfStock ? (
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Sold Out
                </span>
              ) : hasDiscount ? (
                <span className="px-2.5 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                  Sale
                </span>
              ) : null}
            </div>

            {/* Main Jersey Display */}
            <div className="w-full aspect-[4/5] flex items-center justify-center py-4">
              <img
                src={selectedImage === 'back' && backImg ? backImg : frontImg}
                alt={product.name}
                className="max-h-[320px] max-w-[90%] object-contain drop-shadow-md transition-all duration-300"
              />
            </div>

            {/* Front / Back Toggle Thumbnails */}
            {backImg && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedImage('front')}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded border transition-all ${
                    selectedImage === 'front'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImage('back')}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded border transition-all ${
                    selectedImage === 'back'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  Back View
                </button>
              </div>
            )}
          </div>

          {/* Right: Details & Purchase Options */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-[550px]">
            <div className="space-y-4">
              {/* Product Header */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold uppercase text-black font-sans leading-tight">
                  {product.name}
                </h2>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
                  {product.team || product.country || ''} {product.season ? `• ${product.season}` : ''}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className={`text-xl font-bold font-sans ${hasDiscount ? 'text-[#D32F2F]' : 'text-black'}`}>
                  Rs. {effectivePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-neutral-400 line-through font-sans">
                    Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-black">
                    Size: <span className="font-normal text-neutral-600">{selectedSize}</span>
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-xs font-bold rounded border transition-all text-center ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-neutral-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>


              {/* Quantity Stepper */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-black">Quantity:</span>
                <div className="flex items-center border border-neutral-200 rounded">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm text-neutral-600 hover:text-black"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold font-mono">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-sm text-neutral-600 hover:text-black"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-2 border-t border-neutral-100 mt-4">
              <button
                type="button"
                disabled={isOutOfStock || isAdding}
                onClick={handleAddToCart}
                className="w-full py-3 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest transition-colors rounded disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : isAdding ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <Link
                to={`/shop/${product.slug || product._id}`}
                onClick={onClose}
                className="block text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black py-1.5 transition-colors"
              >
                View full product details →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
