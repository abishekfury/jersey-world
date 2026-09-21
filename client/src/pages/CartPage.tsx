import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateLocalQuantity, removeLocalItem, updateCartItem, removeCartItem, applyCoupon, removeCoupon } from '../store/cartSlice';
import { addToast } from '../store/uiSlice';
import { SEO } from '../components/seo/SEO';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (itemId: string | undefined, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    if (itemId) {
      dispatch(updateLocalQuantity({ itemId, quantity: newQty }));
      if (isAuthenticated) {
        dispatch(updateCartItem({ itemId, quantity: newQty }));
      }
    }
  };

  const handleRemoveItem = (itemId: string | undefined) => {
    if (!itemId) return;
    dispatch(removeLocalItem(itemId));
    if (isAuthenticated) {
      dispatch(removeCartItem(itemId));
    }
    dispatch(addToast({ type: 'info', message: 'Item removed from cart.' }));
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const result = await dispatch(applyCoupon(couponInput.trim().toUpperCase())).unwrap();
      dispatch(addToast({ type: 'success', message: result?.message || `Coupon applied: Saved ₹${result?.coupon?.discountAmount || 0}` }));
      setCouponInput('');
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Invalid coupon code.' }));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await dispatch(removeCoupon()).unwrap();
      dispatch(addToast({ type: 'info', message: 'Coupon removed.' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Failed to remove coupon.' }));
    }
  };

  const freeShippingThreshold = 1499;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - (cart?.subtotal || 0));
  const shippingProgressPct = Math.min(100, Math.round(((cart?.subtotal || 0) / freeShippingThreshold) * 100));

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans pb-24">
      <SEO
        title="Your Shopping Cart"
        description="Review selected football jerseys, customize club apparel, apply promo codes, and proceed to secure checkout."
        noIndex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-normal font-display uppercase tracking-tight text-black">
              SHOPPING CART <span className="text-neutral-400 font-sans text-xl">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            </h1>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display uppercase tracking-tight">Your Cart is Empty</h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                You haven't added any official football jerseys to your cart yet. Explore our latest drops and retro collections.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md"
            >
              <span>Explore Jerseys</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
            {/* Left Column: Cart Items List (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Progress Bar */}
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-neutral-800">
                    <Truck className="w-4 h-4 text-[#FF5722]" />
                    {amountNeededForFreeShipping > 0 ? (
                      <span>Add ₹{amountNeededForFreeShipping} more for <strong>FREE EXPRESS SHIPPING</strong></span>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        You've qualified for FREE Express Shipping!
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-neutral-500">{shippingProgressPct}%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#FF5722] h-full rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-sm">
                {items.map((item, idx) => {
                  const product = item.product as any;
                  const itemKey = item._id || `${product?._id || idx}-${item.size}`;
                  const unitPrice = item.price || product?.discountPrice || product?.price || 0;
                  const customPrice = item.customization ? (product?.customizationPrice || 299) : 0;
                  const totalItemPrice = (unitPrice + customPrice) * item.quantity;

                  return (
                    <div key={itemKey} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
                      {/* Thumbnail & Jersey Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <Link to={`/shop/${product?.slug || product?._id}`} className="shrink-0 w-20 h-24 rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200">
                          <img
                            src={product?.images?.front || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80'}
                            alt={product?.name || 'Jersey'}
                            className="w-full h-full object-cover object-center"
                          />
                        </Link>
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                            {product?.team} • {product?.season || '2025/26'}
                          </span>
                          <Link
                            to={`/shop/${product?.slug || product?._id}`}
                            className="text-sm font-bold text-black hover:text-[#FF5722] transition-colors truncate block"
                          >
                            {product?.name || 'Football Jersey'}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-mono font-bold text-neutral-700">
                              Size: {item.size}
                            </span>
                            {item.customization && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px]">
                                Print: #{item.customization.playerNumber} {item.customization.playerName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Selector & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                        <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                            className="p-2 hover:bg-neutral-200 transition-colors text-neutral-600"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold min-w-[28px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                            className="p-2 hover:bg-neutral-200 transition-colors text-neutral-600"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <div className="text-sm font-bold font-mono text-black">
                            ₹{totalItemPrice}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] font-mono text-neutral-400">
                              ₹{unitPrice + customPrice} each
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="p-2 text-neutral-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Application Box */}
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black">
                  <Tag className="w-4 h-4 text-[#FF5722]" />
                  <span>Promotional Voucher / Coupon</span>
                </div>

                {cart?.couponCode ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-900 block uppercase">
                        {cart.couponCode}
                      </span>
                      <span className="text-[10px] text-emerald-700">Coupon applied successfully</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-emerald-800 hover:text-red-600 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. WELCOME10"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 py-2.5 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
              </div>

              {/* Order Calculation Card */}
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-mono">
                  ORDER BREAKDOWN
                </h3>

                <div className="space-y-2.5 text-xs text-neutral-600 font-sans">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-black">₹{cart?.subtotal || 0}</span>
                  </div>

                  {cart?.discount ? (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount Voucher</span>
                      <span className="font-mono font-bold">-₹{cart.discount}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-mono font-semibold text-black">
                      {cart?.shipping === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `₹${cart?.shipping || 79}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>GST (5% Apparel Tax)</span>
                    <span className="font-mono font-semibold text-black">₹{cart?.tax || 0}</span>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold uppercase tracking-wide text-black">Total Payable</span>
                    <span className="text-xl font-bold font-mono text-black">₹{cart?.grandTotal || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  disabled={isLoading || items.length === 0}
                  className="w-full py-4 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Secure Checkout with Razorpay & COD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
