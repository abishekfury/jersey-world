import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="w-full bg-white text-[#171C1B] border-t border-neutral-200 mt-20 font-sans">
      {/* Top Newsletter Bar */}
      <div className="border-b border-neutral-200 bg-[#FAFAFA] py-10 px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF5722] font-mono">
              VIP CLUB ACCESS
            </span>
            <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tight text-black mt-0.5">
              GET 10% OFF YOUR FIRST MATCH KIT
            </h3>
            <p className="text-xs text-neutral-500 font-medium font-sans mt-1">
              Receive secret drop alerts, restock notifications, and exclusive member discounts.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto min-w-[320px] max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-white border border-neutral-300 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-lg transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-6 py-3 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 flex-shrink-0 shadow-sm"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Subscribed!
                </>
              ) : (
                <>
                  Join <Send className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>

      <div className="w-full">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-neutral-200">
          {/* Column 1: Brand Image + Logo */}
          <div className="md:col-span-4 relative overflow-hidden min-h-[360px] md:min-h-[440px] bg-[#F5F5F3] flex flex-col justify-end group">
            <img
              src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=700&q=85"
              alt="Jersey World"
              className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 p-8 space-y-2">
              <Link to="/" className="inline-block">
                <span className="text-4xl font-normal font-display tracking-tight uppercase text-white drop-shadow-lg">
                  JERSEY WORLD<span className="text-[#FF5722]">.</span>
                </span>
              </Link>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                India's premier destination for authentic football matchwear, retro heritage shirts, and player-grade editions.
              </p>
            </div>
          </div>

          {/* Columns 2-5: Links Grid */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
            {/* Quick Links */}
            <div className="px-8 py-12 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black font-sans">Shop Categories</h4>
              <ul className="space-y-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                <li>
                  <Link to="/shop" className="hover:text-black hover:translate-x-1 inline-block transition-all">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/shop?type=Home,Away,Third+Kit" className="hover:text-black hover:translate-x-1 inline-block transition-all">
                    Club Match Jerseys
                  </Link>
                </li>
                <li>
                  <Link to="/shop?league=International" className="hover:text-black hover:translate-x-1 inline-block transition-all">
                    National & World Cup
                  </Link>
                </li>
                <li>
                  <Link to="/shop?type=Player+Version" className="hover:text-black hover:translate-x-1 inline-block transition-all">
                    Player Issue Kits
                  </Link>
                </li>
                <li>
                  <Link to="/shop?type=Retro" className="hover:text-black hover:translate-x-1 inline-block transition-all">
                    Retro Classics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Socials & Community */}
            <div className="px-8 py-12 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black font-sans">Socials & Connect</h4>
              <ul className="space-y-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black hover:translate-x-1 inline-flex items-center gap-1 transition-all"
                  >
                    Instagram <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black hover:translate-x-1 inline-flex items-center gap-1 transition-all"
                  >
                    Facebook <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://whatsapp.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black hover:translate-x-1 inline-flex items-center gap-1 transition-all"
                  >
                    WhatsApp Support <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black hover:translate-x-1 inline-flex items-center gap-1 transition-all"
                  >
                    Twitter / X <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Support & Info */}
            <div className="px-8 py-12 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black font-sans">Help & Support</h4>
              <div className="space-y-3 text-xs text-neutral-600 leading-relaxed font-medium">
                <p>
                  <span className="text-black font-semibold block">Email Support:</span>
                  support@jerseyworld.in
                </p>
                <p>
                  <span className="text-black font-semibold block">Helpline:</span>
                  +91 74011 71934
                </p>
                <p>
                  <span className="text-black font-semibold block">HQ Location:</span>
                  Chennai, Tamil Nadu, India
                </p>
                <div className="pt-2">
                  <Link to="/about" className="text-xs font-bold text-black underline underline-offset-4 hover:text-[#FF5722]">
                    About Jersey World →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-neutral-400 font-medium">
          <div>© {new Date().getFullYear()} JERSEY WORLD. Effortless Shopping, Exceptional Choices.</div>
          <div className="flex items-center gap-6">
            <span className="text-neutral-500">100% Secure Checkout</span>
            <span className="text-neutral-500">Fast India Delivery</span>
            <span className="text-neutral-500">7-Day Free Exchange</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
