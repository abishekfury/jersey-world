import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Cookie, Bell } from 'lucide-react';
import { SEO } from '../components/seo/SEO';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans pb-24">
      <SEO
        title="Privacy Policy"
        description="Learn how GOALZA collects, secures, and handles your personal data, payment transactions, and browsing information."
        canonical="/privacy-policy"
      />

      {/* Header */}
      <div className="bg-[#171C1B] text-white py-16 text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF5722] font-bold">
          LEGAL & DATA PROTECTION
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal font-display uppercase tracking-tight">
          PRIVACY POLICY
        </h1>
        <p className="text-xs text-neutral-400 font-mono">
          Last Updated: March 2026 • Compliant with Indian IT Act & Global Privacy Principles
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF5722]" />
              1. Overview & Commitment
            </h2>
            <p>
              GOALZA ("we", "our", or "us") is dedicated to protecting your privacy. This Privacy Policy details how we collect, use, store, and safeguard your personal data when you visit our website, purchase football apparel, or interact with our virtual fitting room services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Database className="w-5 h-5 text-[#FF5722]" />
              2. Information We Collect
            </h2>
            <p>We collect information to provide, process, and optimize our e-commerce services:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li><strong>Personal Identifiers:</strong> Name, email address, phone number, shipping and billing address.</li>
              <li><strong>Order Data:</strong> Jersey models purchased, sizing choices, transaction timestamps, and order histories.</li>
              <li><strong>Payment Information:</strong> We do NOT store card CVVs or bank passwords. All payments are tokenized securely through PCI-DSS Level 1 compliant gateway partners (Razorpay).</li>
              <li><strong>Device & Telemetry Data:</strong> IP address, browser type, operating system, and anonymous interaction analytics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#FF5722]" />
              3. How We Use Your Data
            </h2>
            <p>Your information is used strictly for legitimate commercial and operational purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>Processing, fulfilling, and dispatching orders via express logistics carriers (BlueDart, Delhivery).</li>
              <li>Sending transactional order confirmations, dispatch tracking updates, and OTP verification codes.</li>
              <li>Preventing fraudulent payments and protecting customer account integrity.</li>
              <li>Improving platform performance, search suggestions, and catalogue merchandising.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Cookie className="w-5 h-5 text-[#FF5722]" />
              4. Cookies & Session Storage
            </h2>
            <p>
              We utilize essential HTTP-only cookies and local session caching to maintain your authenticated session, remember your shopping cart items, and preserve your currency and size preferences. You may disable cookies in your browser settings, though certain checkout features may require cookies for security verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#FF5722]" />
              5. Third-Party Sharing & Security
            </h2>
            <p>
              We never sell or rent your personal data to third-party brokers. We only share necessary data with trusted service providers:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li><strong>Payment Processing:</strong> Razorpay Software Private Limited for encrypted card, UPI, and net banking processing.</li>
              <li><strong>Logistics:</strong> Courier partners strictly for delivery fulfillment and AWB generation.</li>
              <li><strong>Legal Compliance:</strong> Government authorities only when required by valid court order or statutory Indian law.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight font-display flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#FF5722]" />
              6. Your Privacy Rights & Contact
            </h2>
            <p>
              You may request access to, correction of, or permanent deletion of your customer profile and order history at any time. For privacy queries, email our Data Protection Officer at <strong>privacy@goalza.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
