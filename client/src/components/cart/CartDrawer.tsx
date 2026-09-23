import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  closeCartDrawer,
  updateCartItem,
  removeCartItem,
  updateLocalQuantity,
  removeLocalItem,
} from '../../store/cartSlice';

const FREE_SHIPPING_THRESHOLD = 1499;

export const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isOpen = useAppSelector((state) => state.cart.isCartDrawerOpen);
  const cart = useAppSelector((state) => state.cart.cart);
  const items = cart?.items || [];
  const totalItemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const subtotal = cart?.subtotal || 0;

  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleQuantityChange = (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      dispatch(removeLocalItem(itemId));
      dispatch(removeCartItem(itemId));
    } else {
      dispatch(updateLocalQuantity({ itemId, quantity: newQty }));
      dispatch(updateCartItem({ itemId, quantity: newQty }));
    }
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeLocalItem(itemId));
    dispatch(removeCartItem(itemId));
  };

  const handleProceedCheckout = () => {
    dispatch(closeCartDrawer());
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCartDrawer())}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Slide-out White Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white text-black shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FF5722]" />
                  <h3 className="font-display font-bold text-lg uppercase text-black tracking-tight">
                    Shopping Bag ({totalItemCount})
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => dispatch(closeCartDrawer())}
                  aria-label="Close cart"
                  className="p-1.5 rounded-full text-neutral-500 hover:text-black hover:bg-neutral-200 transition-colors"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </motion.button>
              </div>

              {/* Free Express Shipping Meter */}
              {items.length > 0 && (
                <div className="bg-[#FAF9F5] border-b border-neutral-200/80 px-5 py-3">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <div className="flex items-center gap-1.5 text-neutral-800">
                      <Truck className="w-4 h-4 text-[#FF5722]" />
                      {freeShippingProgress >= 100 ? (
                        <span className="text-emerald-600 font-bold">You unlocked FREE Express Shipping! 🎉</span>
                      ) : (
                        <span>
                          Add <span className="font-bold text-[#FF5722]">₹{remainingForFreeShipping}</span> more for FREE shipping
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-neutral-500">{freeShippingProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${freeShippingProgress >= 100 ? 'bg-emerald-500' : 'bg-[#FF5722]'}`}
                    />
                  </div>
                </div>
              )}

              {/* Drawer Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center"
                    >
                      <ShoppingBag className="w-8 h-8 text-neutral-400" />
                    </motion.div>
                    <div>
                      <h4 className="text-xl font-bold text-black font-display uppercase">Your cart is empty</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
                        Explore our new 2026/27 official club & national team match kits.
                      </p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {items.map((item: any) => {
                      const product = item.product as any;
                      const itemPrice =
                        product?.discountPrice && product.discountPrice > 0
                          ? product.discountPrice
                          : product?.price || item.price || 0;

                      return (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-3.5 items-center p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 hover:border-black transition-all"
                        >
                          {/* Square Image */}
                          <div className="w-16 h-20 bg-white border border-neutral-200 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            <img
                              src={product?.images?.front || item.productImage}
                              alt={product?.name || item.productName}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-semibold text-xs text-black truncate">
                              {product?.name || item.productName}
                            </h4>
                            <p className="text-[11px] text-neutral-500 font-medium">
                              Size: <strong className="text-black uppercase">{item.size}</strong>
                            </p>
                            <p className="font-bold text-xs text-black font-mono pt-0.5">
                              ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemove(item._id)}
                              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                            <div className="flex items-center border border-neutral-300 bg-white rounded-md shadow-xs">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                                className="px-2 py-1 text-neutral-600 hover:text-black text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 py-0.5 text-xs font-mono font-bold text-black">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                                className="px-2 py-1 text-neutral-600 hover:text-black text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer: Subtotal & Checkout */}
              {items.length > 0 && (
                <div className="p-5 border-t border-neutral-200 bg-neutral-50/80 space-y-4">
                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center justify-between font-bold text-sm text-black">
                      <span>Subtotal</span>
                      <span className="font-mono text-base font-black">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>India Express Shipping</span>
                      <span className={`font-bold font-mono ${subtotal >= FREE_SHIPPING_THRESHOLD ? 'text-emerald-600' : 'text-neutral-700'}`}>
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : '₹79 (Free above ₹1,499)'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProceedCheckout}
                      className="w-full py-3.5 bg-black hover:bg-[#FF5722] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    <button
                      onClick={() => {
                        dispatch(closeCartDrawer());
                        navigate('/cart');
                      }}
                      className="w-full py-2.5 bg-white border border-neutral-300 hover:border-black text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center"
                    >
                      View Shopping Cart Page
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
