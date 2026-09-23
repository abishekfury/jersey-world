import React from 'react';
import { Truck, Clock, MapPin, Package, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/seo/SEO';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans pb-24">
      <SEO
        title="Shipping & Delivery Policy"
        description="Learn about GOALZA express delivery timelines across India, free shipping thresholds, live PIN code serviceability, and order tracking."
        canonical="/shipping-policy"
      />

      {/* Header */}
      <div className="bg-[#171C1B] text-white py-16 text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF5722] font-bold">
          LOGISTICS & DELIVERY
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal font-display uppercase tracking-tight">
          SHIPPING POLICY
        </h1>
        <p className="text-xs text-neutral-400 font-mono">
          Fast, Reliable All-India Express Courier Network
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#FF5722]" />
              1. Delivery Coverage & Courier Partners
            </h2>
            <p>
              We deliver to over 26,000+ PIN codes across all Indian states and Union Territories through top-tier logistics partners including BlueDart Express, Delhivery, DTDC, and India Post Speed Post.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF5722]" />
              2. Processing & Transit Timelines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <strong className="block text-black font-semibold">Dispatch Time</strong>
                <span className="text-neutral-600">Within 24 to 48 hours from order confirmation.</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <strong className="block text-black font-semibold">Metro Cities</strong>
                <span className="text-neutral-600">2 to 4 business days (Delhi, Mumbai, Bengaluru, Chennai, Kolkata).</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                <strong className="block text-black font-semibold">Rest of India</strong>
                <span className="text-neutral-600">4 to 7 business days depending on location.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Package className="w-5 h-5 text-[#FF5722]" />
              3. Shipping Charges & Free Delivery Threshold
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li><strong>Prepaid Orders above ₹1,499:</strong> Completely <strong className="text-emerald-700">FREE EXPRESS SHIPPING</strong>.</li>
              <li><strong>Orders below ₹1,499:</strong> Nominal flat delivery charge of ₹79 per order.</li>
              <li><strong>Payment Modes:</strong> 100% secure digital payments via Razorpay (UPI, Credit/Debit Cards, Net Banking). Cash on Delivery (COD) is not accepted.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF5722]" />
              4. Real-Time Order Tracking
            </h2>
            <p>
              As soon as your order is packaged and picked up by our courier, you will receive an automated SMS and email containing your live Air Waybill (AWB) tracking number. You can also monitor your shipment directly under your account's <a href="/account/orders" className="text-black font-bold underline">Order History</a> tab.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
