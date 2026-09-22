import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAppDispatch } from '../store';
import { addToast } from '../store/uiSlice';
import { SEO } from '../components/seo/SEO';

export const ContactPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    orderNumber: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      dispatch(addToast({ type: 'error', message: 'Please fill in all required fields.' }));
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      dispatch(addToast({ type: 'success', message: 'Inquiry received! Our team will respond within 12 hours.' }));
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans pb-24">
      <SEO
        title="Contact & Support Helpdesk"
        description="Get in touch with Jersey World customer support for order tracking, size advice, custom jersey printing inquiries, and returns."
        canonical="/contact"
      />

      {/* Hero Banner */}
      <div className="bg-[#171C1B] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF5722] font-bold">
            24/7 CUSTOMER SUPPORT & CARE
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal font-display uppercase tracking-tight">
            HOW CAN WE HELP YOU?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto font-sans leading-relaxed">
            Have questions about an order, custom player printing, sizing, or delivery? Reach out to our dedicated support team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Methods & FAQ (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold font-display uppercase tracking-tight text-black">
                Direct Contact Channels
              </h2>

              <div className="space-y-4 text-xs">
                <a
                  href="mailto:support@jerseyworld.com"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-[#FF5722] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-neutral-500 font-medium block">Email Support</span>
                    <strong className="text-black font-semibold text-sm">support@jerseyworld.com</strong>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">Average response under 4 hours</span>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-neutral-500 font-medium block">WhatsApp & Phone Helpdesk</span>
                    <strong className="text-black font-semibold text-sm">+91 98765 43210</strong>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">Mon – Sat: 9:00 AM – 8:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-neutral-500 font-medium block">Headquarters & Fulfillment Hub</span>
                    <strong className="text-black font-semibold text-sm">Jersey World Retail Private Limited</strong>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      Brigade Tech Park, Whitefield, Bangalore, Karnataka 560066, India
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="p-6 rounded-3xl bg-neutral-900 text-white space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#FF5722]" />
                <h3 className="text-sm font-bold uppercase tracking-wider">The Jersey World Promise</h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Every football kit is inspected for authentic crest badges, heat-pressed sponsors, and certified moisture-wicking material before dispatch.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
              {isSent ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-display uppercase">Message Sent Successfully!</h3>
                  <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                    Thank you for contacting Jersey World. A customer success representative has been assigned to your ticket and will reply via email shortly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSent(false);
                      setFormData({ name: '', email: '', subject: '', orderNumber: '', message: '' });
                    }}
                    className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold font-display uppercase tracking-tight text-black mb-2">
                    Send Us a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Cristiano Ronaldo"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ronaldo@example.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-black focus:outline-none bg-white"
                      >
                        <option value="">Select Topic</option>
                        <option value="Order Status">Track Existing Order</option>
                        <option value="Sizing Advice">Size & Fit Guidance</option>
                        <option value="Product Availability">Product Availability & Restock</option>
                        <option value="Exchange or Return">Exchange / Return Request</option>
                        <option value="Wholesale">Bulk / Club Inquiry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Order Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        placeholder="e.g. JW-2026-98124"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-xs font-mono uppercase focus:ring-2 focus:ring-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please provide order details, jersey names, or specific questions..."
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-black focus:outline-none font-sans resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <span>Submit Support Ticket</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
