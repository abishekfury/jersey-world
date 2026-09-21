import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Scale, DollarSign, Shirt } from 'lucide-react';
import { SEO } from '../components/seo/SEO';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans pb-24">
      <SEO
        title="Terms & Conditions of Sale"
        description="Review the terms and conditions governing jersey purchases, customized player prints, pricing, returns, and intellectual property."
        canonical="/terms"
      />

      {/* Header */}
      <div className="bg-[#171C1B] text-white py-16 text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF5722] font-bold">
          LEGAL AGREEMENT
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal font-display uppercase tracking-tight">
          TERMS & CONDITIONS
        </h1>
        <p className="text-xs text-neutral-400 font-mono">
          Effective Date: March 2026 • Governing E-Commerce Transactions
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF5722]" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing the Jersey World website, placing an order, or utilizing our services, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you disagree with any part of these terms, please do not use our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Shirt className="w-5 h-5 text-[#FF5722]" />
              2. Custom Jerseys & Personalized Printing
            </h2>
            <p>
              We offer heat-pressed player name and number customization on eligible football jerseys:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>Customization text and numbers are printed exactly as entered during order placement. Customers are responsible for verifying spelling and digit numbers before checkout.</li>
              <li><strong>Non-Returnable:</strong> In accordance with standard e-commerce practice, customized/personalized jerseys cannot be returned or refunded unless there is a verifiable manufacturing defect in the shirt or printing.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#FF5722]" />
              3. Pricing, Taxes & Payment
            </h2>
            <p>
              All prices listed on Jersey World are in Indian Rupees (INR ₹) and are inclusive of applicable goods and services tax (5% GST on apparel) unless stated otherwise.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>We accept prepaid payments via Razorpay (UPI, Credit/Debit Cards, Net Banking) and Cash on Delivery (COD) for eligible pincodes.</li>
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
