import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SaleNotification {
  id: string;
  name: string;
  location: string;
  product: string;
  timeAgo: string;
  image: string;
  slug: string;
}

const SAMPLE_SALES: SaleNotification[] = [
  {
    id: '1',
    name: 'Aravind K.',
    location: 'Bengaluru, India',
    product: 'Real Madrid 2026/27 Royal White',
    timeAgo: '2 minutes ago',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80',
    slug: 'real-madrid-2026-27-royal-white-edition',
  },
  {
    id: '2',
    name: 'Rohan M.',
    location: 'Mumbai, India',
    product: 'Barcelona 2026/27 Blaugrana Heritage',
    timeAgo: '6 minutes ago',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
    slug: 'barcelona-2026-27-blaugrana-heritage',
  },
  {
    id: '3',
    name: 'Siddharth P.',
    location: 'Chennai, India',
    product: 'Arsenal 2026/27 Emirates Red & White',
    timeAgo: '11 minutes ago',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=120&q=80',
    slug: 'arsenal-2026-27-emirates-red-white',
  },
  {
    id: '4',
    name: 'Tanya S.',
    location: 'Delhi, India',
    product: 'Vintage Brazil 1998 Retro Classic',
    timeAgo: '15 minutes ago',
    image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=120&q=80',
    slug: 'vintage-brazil-1998',
  },
];

export const LiveSalesProof: React.FC = () => {
  const [currentSale, setCurrentSale] = useState<SaleNotification | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial popup after 4 seconds
    const initialTimeout = setTimeout(() => {
      setCurrentSale(SAMPLE_SALES[0]);
    }, 4000);

    let currentIndex = 0;
    const interval = setInterval(() => {
      setCurrentSale(null); // trigger exit
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % SAMPLE_SALES.length;
        setCurrentSale(SAMPLE_SALES[currentIndex]);
      }, 800);
    }, 14000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-[340px] pointer-events-none hidden sm:block">
      <AnimatePresence>
        {currentSale && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border border-neutral-200/80 p-3.5 shadow-xl rounded-xl flex items-center gap-3.5 group hover:border-black transition-colors"
          >
            <div className="relative w-12 h-12 bg-[#F2F2F0] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img
                src={currentSale.image}
                alt={currentSale.product}
                className="w-full h-full object-contain p-1"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </span>
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-800">
                <span>{currentSale.name}</span>
                <span className="text-[10px] text-neutral-400 font-normal">({currentSale.location})</span>
              </div>
              <Link
                to={`/shop/${currentSale.slug}`}
                className="block text-xs font-bold text-black truncate hover:text-[#FF5722] transition-colors"
              >
                Purchased {currentSale.product}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-neutral-400 font-mono">{currentSale.timeAgo}</span>
                <span className="text-[10px] font-bold text-emerald-600 font-mono uppercase">Verified Buyer</span>
              </div>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-neutral-400 hover:text-black p-1 transition-colors self-start"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

