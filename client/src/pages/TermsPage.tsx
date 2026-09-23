import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Scale, DollarSign, Shirt } from 'lucide-react';
import { SEO } from '../components/seo/SEO';

const termsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Service & Sales Agreement',
  description: 'Review the terms and conditions governing jersey purchases, pricing, shipping, returns, and intellectual property.',
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans pb-24">
      <SEO
        title="Terms of Service & Sales Agreement"
        description="Review the terms and conditions governing jersey purchases, pricing, shipping, returns, and intellectual property."
        keywords="goalza terms, sales agreement, return terms, online shopping conditions, goalza"
        jsonLd={termsJsonLd}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-black text-black font-display uppercase tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-1">
          Effective Date: September 2026 • Version 2.1
        </p>

        <div className="mt-8 space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF5722]" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or purchasing items on GOALZA (goalza.vercel.app), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any portion of these terms, you should immediately discontinue the use of our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Shirt className="w-5 h-5 text-[#FF5722]" />
              2. Authenticity & Sizing
            </h2>
            <p>
              All jerseys sold on GOALZA are authentic club and international kits:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>Our jerseys adhere to international manufacturer sizing charts. Please consult the interactive size guide on product detail pages prior to ordering.</li>
              <li>Every item comes brand new with original manufacturer tags and official club badges.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#FF5722]" />
              3. Pricing, Taxes & Payment
            </h2>
            <p>
              All prices listed on GOALZA are in Indian Rupees (INR ₹) and are inclusive of applicable goods and services tax (5% GST on apparel) unless stated otherwise.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>We accept 100% secure prepaid digital payments via Razorpay (UPI, Credit/Debit Cards, Net Banking). Cash on Delivery (COD) is not accepted.</li>
              <li>In the rare event of a typographical pricing error, we reserve the right to cancel orders placed at incorrect prices and issue a full refund immediately.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#FF5722]" />
              4. Order Fulfillment & Cancellations
            </h2>
            <p>
              Orders can be cancelled by the customer from their account portal before the item status changes to <em>"Shipped"</em>. Once an order is handed over to the courier with an active AWB tracking number, cancellations cannot be processed; the customer may initiate a return after delivery according to our Return Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#FF5722]" />
              5. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
