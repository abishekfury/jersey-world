import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSearchModalOpen } from '../../store/uiSlice';
import { productService } from '../../services/api';
import { IProduct } from '@shared/types';

export const SearchBarModal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.ui.isSearchModalOpen);

  const trendingSearches = [
    'Real Madrid',
    'Barcelona',
    'Arsenal',
    'Manchester City',
    'Argentina',
    'Retro Vintage',
  ];

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.getProducts({ search: searchTerm, limit: 6 });
        setSuggestions(res.data.products || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(setSearchModalOpen(false));
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  const handleSelectProduct = (product: IProduct) => {
    dispatch(setSearchModalOpen(false));
    navigate(`/shop/${product.slug || product._id}`);
  };

  const handleSearchSubmit = (term: string) => {
    if (!term.trim()) return;
    dispatch(setSearchModalOpen(false));
    navigate(`/shop?search=${encodeURIComponent(term.trim())}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-6 sm:pt-12 md:pt-16 p-4 bg-black/60 backdrop-blur-md font-sans">
        {/* Background click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={() => dispatch(setSearchModalOpen(false))}
        />

        {/* Top Search Container */}
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl z-10 space-y-3"
        >
          {/* Search Input Bar */}
          <div className="relative flex items-center bg-white rounded-full shadow-2xl px-5 py-3.5 sm:py-4 border border-neutral-200">
            <Search className="w-5 h-5 text-neutral-500 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by team, player, club, or league..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm) {
                  handleSearchSubmit(searchTerm);
                }
              }}
              autoFocus
              className="w-full bg-transparent text-sm sm:text-base text-black placeholder-neutral-400 focus:outline-none font-sans"
            />

            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-neutral-400 hover:text-black p-1 transition-colors mr-1"
                aria-label="Clear text"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => dispatch(setSearchModalOpen(false))}
              className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-black transition-colors ml-1"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Trending Searches Suggestions (when input is empty) */}
          {!searchTerm.trim() && (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <Flame className="w-4 h-4 text-[#FF5722]" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearchSubmit(term)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors text-neutral-800"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Search Results Dropdown */}
          {searchTerm.trim() && (
            <div className="bg-white rounded-2xl p-4 shadow-2xl border border-neutral-200 space-y-2 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                <span>{isSearching ? 'Searching...' : `${suggestions.length} Results Found`}</span>
                <button
                  onClick={() => handleSearchSubmit(searchTerm)}
                  className="text-black hover:text-[#FF5722] inline-flex items-center gap-1 transition-colors"
                >
                  <span>View all results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {suggestions.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {suggestions.map((item) => {
                    const frontImg = item.images?.front || (item as any).image;
                    const price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;

                    return (
                      <div
                        key={item._id}
                        onClick={() => handleSelectProduct(item)}
                        className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={frontImg}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold uppercase text-black truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-neutral-500 uppercase tracking-wide">
                            {item.team || item.country || item.league} • {item.season || '24/25'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm font-bold text-black font-sans">
                            Rs. {price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                          {item.discountPrice && item.discountPrice > 0 && (
                            <span className="text-[10px] text-neutral-400 line-through">
                              Rs. {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : !isSearching ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-medium">
                  No jerseys found for &ldquo;{searchTerm}&rdquo;. Try another search term.
                </div>
              ) : null}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
