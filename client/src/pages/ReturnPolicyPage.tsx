import React from 'react';
import { RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, Clock, HelpCircle } from 'lucide-react';
import { SEO } from '../components/seo/SEO';

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans pb-24">
      <SEO
        title="Return & Refund Policy"
        description="Understand the Jersey World 7-day hassle-free return and exchange policy for football kits, size replacements, and refund processing."
        canonical="/return-policy"
      />

      {/* Header */}
      <div className="bg-[#171C1B] text-white py-16 text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF5722] font-bold">
          CUSTOMER SATISFACTION
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal font-display uppercase tracking-tight">
          RETURN & REFUND POLICY
        </h1>
        <p className="text-xs text-neutral-400 font-mono">
          7-Day Hassle-Free Size Exchange & Verified Buyer Protection
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#FF5722]" />
              1. 7-Day Return & Size Exchange Guarantee
            </h2>
            <p>
              We want you to wear your team colors with total confidence. If your jersey doesn't fit as expected or you are not completely satisfied, you can request an exchange or return within <strong>7 days from the confirmed delivery date</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF5722]" />
              2. Return Eligibility Conditions
            </h2>
            <p>To qualify for a return or size exchange, the item must fulfill the following criteria:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>The jersey must be unused, unwashed, and in its original pristine condition.</li>
              <li>All original club tags, hologram authenticity labels, and original polybag packaging must be intact.</li>
              <li>Proof of purchase (Order reference number) must be provided.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF5722]" />
              3. Non-Returnable Items
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li><strong>Customized / Personalized Jerseys:</strong> Shirts with custom player names, individual personal names, or custom numbers printed cannot be returned or refunded unless there is a confirmed manufacturing defect.</li>
              <li><strong>Items marked as "Final Clearance":</strong> Items discounted at over 60% during annual warehouse clearance sales.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF5722]" />
              4. Reverse Pickup & Refund Timelines
            </h2>
            <p>
              Once your return request is approved in the customer portal, our courier will arrange a reverse pickup from your address within 24-48 hours.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-3">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <strong className="block text-black font-semibold">Prepaid Orders (Razorpay)</strong>
                <span className="text-neutral-600">Refund credited to original bank account/UPI within 3-5 business days of item inspection.</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <strong className="block text-black font-semibold">Cash on Delivery (COD)</strong>
                <span className="text-neutral-600">Refund transferred directly to customer's verified UPI ID or Bank account within 48 hours of inspection.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
