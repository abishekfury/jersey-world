import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Lock,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Tag,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { orderService, shippingService, cartService } from '../services/api';
import { clearCart, fetchCart, applyCouponLocal, removeCouponLocal } from '../store/cartSlice';
import { addToast } from '../store/uiSlice';
import { SEO } from '../components/seo/SEO';
import { trackPurchase } from '../utils/analytics';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart.cart);
  const items = cart?.items || [];

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod] = useState<'PREPAID'>('PREPAID');
  const [billingAddressSame, setBillingAddressSame] = useState(true);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    apartment: '',
    area: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    country: 'India',
    saveInfo: false,
  });

  // Shipping Serviceability & Live Rate State
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [serviceability, setServiceability] = useState<{
    checked: boolean;
    available: boolean;
    city?: string;
    state?: string;
    estimatedDeliveryDays?: string;
    estimatedDeliveryDate?: string;
    message?: string;
  }>({
    checked: false,
    available: true,
    city: '',
    state: '',
    estimatedDeliveryDays: '2–4 business days',
    message: '',
  });

  const [shippingRate, setShippingRate] = useState<{
    totalWeightGrams: number;
    shippingCharge: number;
    courierCost: number;
    isFreeShipping: boolean;
    subtotal: number;
    tax: number;
    grandTotal: number;
  }>({
    totalWeightGrams: items.reduce((sum, it) => sum + (it.product?.shipping?.weight || 350) * it.quantity, 0),
    shippingCharge: 0,
    courierCost: 64,
    isFreeShipping: true,
    subtotal: cart?.subtotal || 0,
    tax: Math.round((cart?.subtotal || 0) * 0.05),
    grandTotal: cart?.grandTotal || 0,
  });

  useEffect(() => {
    // Pre-fill email and name if user is logged in
    if (isAuthenticated && user) {
      setAddressForm((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        firstName: prev.firstName || user.name?.split(' ')[0] || '',
        lastName: prev.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Recalculate local shipping rate state when cart changes
  useEffect(() => {
    const sub = cart?.subtotal || 0;
    const disc = cart?.discount || 0;
    const isFree = sub >= 1499;
    const ship = isFree ? 0 : 79;
    const tx = Math.round((sub - disc) * 0.05);
    const finalTot = Math.max(0, sub - disc + ship + tx);

    setShippingRate((prev) => ({
      ...prev,
      subtotal: sub,
      isFreeShipping: isFree,
      shippingCharge: ship,
      tax: tx,
      grandTotal: finalTot,
    }));
  }, [cart?.subtotal, cart?.discount]);

  // Check PIN serviceability & fetch shipping rate whenever PIN or payment method changes
  const checkPincodeAndFetchRate = async (pincodeToTest?: string) => {
    const pin = (pincodeToTest || addressForm.pincode).trim();
    if (pin.length !== 6 || !/^[1-9][0-9]{5}$/.test(pin)) {
      setServiceability({
        checked: true,
        available: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    setIsCheckingPincode(true);
    try {
      // 1. Check Serviceability
      const servRes = await shippingService.checkServiceability(pin);
      const servData = servRes.data.data;

      if (!servData.available) {
        setServiceability({
          checked: true,
          available: false,
          message: servData.message || 'Sorry, delivery is currently unavailable to this PIN code.',
        });
        setIsCheckingPincode(false);
        return;
      }

      setServiceability({
        checked: true,
        available: true,
        city: servData.city,
        state: servData.state,
        estimatedDeliveryDays: servData.estimatedDeliveryDays,
        estimatedDeliveryDate: servData.estimatedDeliveryDate,
        message: servData.message || `Delivery available to ${pin} (${servData.city}, ${servData.state})`,
      });

      // Auto-update city and state in address form
      if (servData.city || servData.state) {
        setAddressForm((prev) => ({
          ...prev,
          city: servData.city || prev.city,
          state: servData.state || prev.state,
        }));
      }

      // 2. Fetch Rate
      if (items.length > 0) {
        const rateRes = await shippingService.calculateRate({
          pincode: pin,
          items: items.map((it) => ({
            productId: it.product._id,
            quantity: it.quantity,
          })),
          paymentMethod,
          couponDiscount: cart?.discount || 0,
        });

        const rate = rateRes.data.data;
        const sub = rate.subtotal;
        const disc = cart?.discount || 0;
        const ship = rate.shippingCharge;
        const tx = Math.round(sub * 0.05);
        const finalTot = Math.max(0, sub - disc + ship + tx);

        setShippingRate({
          totalWeightGrams: rate.totalWeightGrams,
          shippingCharge: rate.shippingCharge,
          courierCost: rate.courierCost,
          isFreeShipping: rate.isFreeShipping,
          subtotal: sub,
          tax: tx,
          grandTotal: finalTot,
        });
      }
    } catch (err: any) {
      setServiceability({
        checked: true,
        available: false,
        message: err.response?.data?.message || 'Could not verify delivery to this PIN code.',
      });
    } finally {
      setIsCheckingPincode(false);
    }
  };

  useEffect(() => {
    if (addressForm.pincode.length === 6 && items.length > 0) {
      checkPincodeAndFetchRate(addressForm.pincode);
    }
  }, [addressForm.pincode, items.length]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setIsApplyingCoupon(true);
    try {
      const res = await cartService.applyCoupon(code, cart?.subtotal || 0);
      if (res.data?.success && res.data?.coupon) {
        const c = res.data.coupon;
        dispatch(
          applyCouponLocal({
            code: c.code,
            discountPercent: c.discountPercent,
            discountAmount: c.discountAmount,
          })
        );
        dispatch(addToast({ type: 'success', message: res.data.message || 'Promo coupon applied successfully!' }));
        setCouponInput('');
      } else {
        dispatch(addToast({ type: 'error', message: res.data?.message || 'Invalid or expired promo code.' }));
      }
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Invalid or expired promo code.' }));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    dispatch(removeCouponLocal());
    dispatch(addToast({ type: 'info', message: 'Promo code removed.' }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressForm.email || !addressForm.email.includes('@')) {
      dispatch(addToast({ type: 'error', message: 'Please enter a valid email address for order confirmation & tracking.' }));
      return;
    }

    if (serviceability.checked && !serviceability.available) {
      dispatch(addToast({ type: 'error', message: 'Delivery is unavailable to the selected PIN code.' }));
      return;
    }

    const fullName = `${addressForm.firstName} ${addressForm.lastName}`.trim();
    if (!addressForm.address || !addressForm.phone || !fullName || !addressForm.city || !addressForm.pincode) {
      dispatch(addToast({ type: 'error', message: 'Please fill in all mandatory delivery address fields.' }));
      return;
    }

    if (items.length === 0) {
      dispatch(addToast({ type: 'error', message: 'Your cart is empty.' }));
      return;
    }

    setIsProcessing(true);
    const enrichedAddress = { ...addressForm, fullName };

    try {
      const orderPayload = {
        shippingAddress: {
          ...enrichedAddress,
          email: addressForm.email,
          street: enrichedAddress.address,
          postalCode: enrichedAddress.pincode,
        },
        paymentMethod,
        items: items.map((it) => ({
          productId: typeof it.product === 'object' ? it.product._id : it.product,
          size: it.size,
          quantity: it.quantity,
          customization: it.customization,
        })),
        couponCode: cart?.couponCode,
      };

      const res = await orderService.createOrder(orderPayload);
      const createdOrder = res.data.data.order;

      // Online Prepaid Payment via Razorpay
      const paymentDetails = res.data.data.paymentDetails;
      if (paymentDetails && (window as any).Razorpay) {
        const options = {
          key: paymentDetails.key,
          amount: paymentDetails.amount * 100,
          currency: 'INR',
          name: 'Jersey World',
          description: `Payment for Order ${createdOrder.orderNumber}`,
          order_id: paymentDetails.orderId,
          prefill: {
            name: enrichedAddress.fullName,
            contact: addressForm.phone,
            email: addressForm.email || user?.email,
          },
          theme: { color: '#000000' },
          modal: {
            ondismiss: () => {
              dispatch(addToast({ type: 'info', message: 'Payment window was closed.' }));
              navigate(`/order-failure/${createdOrder._id || createdOrder.orderNumber}`);
            },
          },
          handler: async (response: any) => {
            try {
              await orderService.verifyPayment({
                orderId: paymentDetails.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
              trackPurchase(createdOrder);
              dispatch(clearCart());
              dispatch(addToast({ type: 'success', message: 'Payment confirmed! Package ready to dispatch.' }));
              navigate(`/order-success/${createdOrder._id || createdOrder.orderNumber}`);
            } catch {
              dispatch(addToast({ type: 'error', message: 'Payment verification failed.' }));
              navigate(`/order-failure/${createdOrder._id || createdOrder.orderNumber}`);
            }
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function () {
          dispatch(addToast({ type: 'error', message: 'Transaction could not be completed.' }));
          navigate(`/order-failure/${createdOrder._id || createdOrder.orderNumber}`);
        });
        rzp.open();
      } else {
        // Fallback demo simulation
        trackPurchase(createdOrder);
        dispatch(clearCart());
        dispatch(addToast({ type: 'success', message: 'Order placed successfully! AWB Generated.' }));
        navigate(`/order-success/${createdOrder._id || createdOrder.orderNumber}`);
      }
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to place order.' }));
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6 bg-white text-black font-sans">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-normal font-display uppercase tracking-tight text-black">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            You don't have any jerseys in your cart yet. Browse our authentic matchwear collection.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#FF5722] transition-colors shadow-md"
        >
          Explore Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
  ];

  const inputClass =
    'w-full bg-neutral-50 border border-neutral-300 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-1 focus:ring-black rounded-xl px-4 py-3 text-sm text-black placeholder-neutral-400 transition-all font-sans outline-none';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 font-sans';

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      <SEO title="Secure Checkout" noIndex={true} />
      {/* ── Top Breadcrumbs & Stepper ── */}
      <div className="border-b border-neutral-200 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Link to="/" className="hover:text-black transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-black font-semibold">Checkout</span>
            </div>

            {/* Security Guarantee Pill */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
              <Lock className="w-3.5 h-3.5 text-green-600" />
              <span>256-Bit SSL Encrypted & Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-normal font-display uppercase tracking-tight text-black">
            Secure Checkout
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Complete your order with express delivery across India.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ── LEFT COLUMN: Form Sections (Span 7) ── */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. Guest Sign In Banner (if not logged in) */}
              {!isAuthenticated && (
                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                      ?
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black uppercase tracking-wider">Already have an account?</p>
                      <p className="text-xs text-neutral-500">Sign in to use your saved addresses and track orders.</p>
                    </div>
                  </div>
                  <Link
                    to="/login?redirect=/checkout"
                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#FF5722] transition-colors shrink-0"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* 2. Contact Information Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h2 className="text-base font-bold uppercase tracking-wider text-black font-sans">
                      Contact Information
                    </h2>
                  </div>
                  {isAuthenticated && (
                    <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Signed in as {user?.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                    className={inputClass}
                    required
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">We'll send order confirmation and tracking details here.</p>
                </div>
              </div>

              {/* 3. Delivery / Shipping Address Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-base font-bold uppercase tracking-wider text-black font-sans">
                    Delivery Address
                  </h2>
                </div>

                {/* Country Selection */}
                <div>
                  <label className={labelClass}>Country / Region</label>
                  <div className="relative">
                    <select
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className={`${inputClass} appearance-none pr-10 font-medium cursor-pointer`}
                    >
                      <option value="India">India (Domestic Express)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul"
                      value={addressForm.firstName}
                      onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={addressForm.lastName}
                      onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className={labelClass}>Street Address *</label>
                  <input
                    type="text"
                    placeholder="House / Flat / Block No., Street Name, Area"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Apartment / Landmark */}
                <div>
                  <label className={labelClass}>Apartment, Suite, Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near City Center Mall, 4th Floor"
                    value={addressForm.apartment}
                    onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* City / State / PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>State *</label>
                    <div className="relative">
                      <select
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>PIN Code *</label>
                    <input
                      type="text"
                      placeholder="6 Digits"
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                {/* Live Pincode Verification Feedback */}
                {serviceability.checked && (
                  <div
                    className={`flex items-start gap-2.5 text-xs p-3.5 rounded-xl border transition-all ${
                      serviceability.available
                        ? 'bg-green-50/80 border-green-200 text-green-800'
                        : 'bg-red-50/80 border-red-200 text-red-700'
                    }`}
                  >
                    {serviceability.available ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">{serviceability.message}</p>
                      {serviceability.estimatedDeliveryDays && (
                        <p className="text-[11px] opacity-90 mt-0.5">
                          Estimated Delivery: <strong className="underline">{serviceability.estimatedDeliveryDays}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {isCheckingPincode && (
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5 animate-pulse">
                    <Truck className="w-3.5 h-3.5 text-[#FF5722]" /> Verifying delivery serviceability for PIN code…
                  </p>
                )}

                {/* Phone Number */}
                <div>
                  <label className={labelClass}>Phone Number (For Delivery Updates) *</label>
                  <div className="flex gap-2">
                    <div className="px-3.5 py-3 bg-neutral-100 border border-neutral-300 rounded-xl text-sm font-semibold text-neutral-600 shrink-0">
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                {/* Save Info Checkbox */}
                <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addressForm.saveInfo}
                    onChange={(e) => setAddressForm({ ...addressForm, saveInfo: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
                  />
                  <span className="text-xs text-neutral-700 font-medium">Save this address for faster checkout next time</span>
                </label>
              </div>

              {/* 4. Shipping Method Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-base font-bold uppercase tracking-wider text-black font-sans">
                    Shipping Method
                  </h2>
                </div>

                <div className="p-4 rounded-xl border-2 border-black bg-neutral-50 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-black" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black flex items-center gap-2">
                        <span>India Express Air Courier</span>
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                          Fast
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {serviceability.checked && serviceability.estimatedDeliveryDays
                          ? `Delivery window: ${serviceability.estimatedDeliveryDays}`
                          : 'Expected delivery: 2–4 business days'}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-black font-mono">
                    {shippingRate.isFreeShipping ? (
                      <span className="text-green-700 font-bold">FREE</span>
                    ) : (
                      `₹${shippingRate.shippingCharge}`
                    )}
                  </span>
                </div>
              </div>

              {/* 5. Payment Options Card */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h2 className="text-base font-bold uppercase tracking-wider text-black font-sans">
                      Payment Method
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-400 flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3 text-green-600" /> Encrypted
                  </span>
                </div>

                <div className="space-y-3">
                  {/* 100% Prepaid Online Option */}
                  <div className="p-4 rounded-xl border-2 border-black bg-neutral-50/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-black" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#FF5722]" />
                            <span>100% Secure Online Payment (UPI, Cards, NetBanking, EMI)</span>
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                            Google Pay, PhonePe, Paytm, All Major Cards & NetBanking
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Instant Verification
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-200/60 flex items-center gap-2 text-xs text-neutral-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span>Zero payment gateway surcharge. Instant order confirmation & priority BlueDart dispatch.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Billing Address Selection */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                    5
                  </span>
                  <h2 className="text-base font-bold uppercase tracking-wider text-black font-sans">
                    Billing Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setBillingAddressSame(true)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      billingAddressSame
                        ? 'border-black bg-neutral-50 font-bold'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        billingAddressSame ? 'border-black' : 'border-neutral-400'
                      }`}
                    >
                      {billingAddressSame && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <span className="text-xs font-medium">Same as delivery address</span>
                  </div>

                  <div
                    onClick={() => setBillingAddressSame(false)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      !billingAddressSame
                        ? 'border-black bg-neutral-50 font-bold'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        !billingAddressSame ? 'border-black' : 'border-neutral-400'
                      }`}
                    >
                      {!billingAddressSame && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <span className="text-xs font-medium">Use different billing address</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ── RIGHT COLUMN: Order Summary & Pay CTA (Span 5) ── */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">

              <div className="bg-neutral-50 border border-neutral-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">

                {/* Card Title */}
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <h3 className="font-display uppercase text-lg font-normal tracking-tight text-black">
                    Order Summary
                  </h3>
                  <span className="text-xs font-mono font-bold bg-white border border-neutral-200 px-2.5 py-1 rounded-full text-neutral-700">
                    {items.reduce((sum, it) => sum + it.quantity, 0)} Items
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {items.map((item) => {
                    const p = item.product;
                    const itemPrice = p?.discountPrice && p.discountPrice > 0 ? p.discountPrice : (p?.price || item.price);

                    return (
                      <div key={item._id || item.product?._id} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white transition-colors">
                        {/* Jersey Image Box */}
                        <div className="relative w-16 h-20 bg-[#ECEAE4] border border-neutral-200/70 rounded-xl flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                          <img
                            src={p?.images?.front || p?.images?.back || ''}
                            alt={p?.name || 'Jersey'}
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono shadow-sm">
                            {item.quantity}
                          </span>
                        </div>

                        {/* Title & Specs */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-black uppercase leading-tight line-clamp-1">
                            {p?.name || 'Jersey'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase bg-white border border-neutral-200 px-1.5 py-0.5 rounded text-neutral-700">
                              Size: {item.size}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-mono font-bold text-black shrink-0">
                          ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Input */}
                <div className="border-t border-neutral-200 pt-4 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 font-sans flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#FF5722]" /> Have a promo code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FIRST10, WORLD10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs uppercase font-mono font-semibold text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                    >
                      {isApplyingCoupon ? 'Applying…' : 'Apply'}
                    </button>
                  </div>

                  {cart?.discount ? (
                    <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-medium mt-2">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-green-600" />
                        Code Active: <strong>{cart.couponCode || 'PROMO'}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-neutral-200 pt-4 space-y-2.5 text-xs text-neutral-600 font-sans">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-black">
                      ₹{shippingRate.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      Shipping
                      {shippingRate.isFreeShipping && (
                        <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.2 rounded font-semibold">
                          Free over ₹1,499
                        </span>
                      )}
                    </span>
                    {shippingRate.isFreeShipping ? (
                      <span className="font-mono font-bold text-green-700">FREE</span>
                    ) : (
                      <span className="font-mono font-bold text-black">₹{shippingRate.shippingCharge}</span>
                    )}
                  </div>

                  {cart?.discount ? (
                    <div className="flex items-center justify-between text-green-700 font-medium">
                      <span>Promo Discount</span>
                      <span className="font-mono font-bold">-₹{cart.discount.toLocaleString('en-IN')}</span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Estimated GST (5% Included)</span>
                    <span className="font-mono">₹{shippingRate.tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Total Line */}
                <div className="border-t-2 border-neutral-200 pt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-bold uppercase tracking-tight text-black font-sans">
                      Grand Total
                    </span>
                    <p className="text-[11px] text-neutral-400">Includes all taxes and shipping</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-black">
                      ₹{shippingRate.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Pay Now Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-black hover:bg-[#FF5722] text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group font-sans cursor-pointer"
                >
                  {isProcessing ? (
                    'Processing Order…'
                  ) : (
                    <>
                      Pay Now · ₹{shippingRate.grandTotal.toLocaleString('en-IN')}{' '}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                {/* Trust Badges */}
                <div className="pt-2 border-t border-neutral-200/70 grid grid-cols-3 gap-2 text-center text-[10px] text-neutral-500 font-medium">
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/70 border border-neutral-200/50">
                    <ShieldCheck className="w-4 h-4 text-[#FF5722]" />
                    <span>100% Authentic</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/70 border border-neutral-200/50">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/70 border border-neutral-200/50">
                    <Truck className="w-4 h-4 text-black" />
                    <span>Express Delivery</span>
                  </div>
                </div>

              </div>

              {/* Policy Links */}
              <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-400 text-center">
                <Link to="/about" className="hover:text-black transition-colors">Return Policy</Link>
                <span>•</span>
                <Link to="/about" className="hover:text-black transition-colors">Shipping Terms</Link>
                <span>•</span>
                <Link to="/about" className="hover:text-black transition-colors">Privacy Notice</Link>
              </div>

            </div>

          </div>
        </form>
      </div>
    </div>
  );
};
