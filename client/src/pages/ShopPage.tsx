import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService, categoryService } from '../services/api';
import { IProduct } from '@shared/types';
import type { JerseySize } from '@shared/types';
import { ProductCard } from '../components/product/ProductCard';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { SortDropdown } from '../components/product/SortDropdown';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, totalPages: 1 });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Meta options
  const [teams, setTeams] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Filter states derived from URL search params
  const searchQuery = searchParams.get('search') || '';
  const selectedTeam = searchParams.get('team') || '';
  const selectedCountry = searchParams.get('country') || '';
  const selectedLeague = searchParams.get('league') || '';
  const selectedType = searchParams.get('type') || '';
  const selectedSize = searchParams.get('size') || '';
  const sortBy = searchParams.get('sortBy') || 'featured';
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 8000;
  const inStockOnly = searchParams.get('inStock') === 'true';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  // Fetch taxonomy metadata
  useEffect(() => {
    categoryService.getMetadata().then((res) => {
      setTeams(res.data.teams);
      setCountries(res.data.countries);
      setLeagues(res.data.leagues);
      setTypes(res.data.types);
    });
  }, []);

  // Fetch products whenever search params change
  useEffect(() => {
    setIsLoading(true);
    const filterQuery: any = {
      search: searchQuery || undefined,
      team: selectedTeam || undefined,
      country: selectedCountry || undefined,
      league: selectedLeague || undefined,
      type: selectedType || undefined,
      size: selectedSize || undefined,
      maxPrice: maxPrice < 8000 ? maxPrice : undefined,
      inStock: inStockOnly || undefined,
      sortBy,
      page,
      limit: 16,
    };

    productService
      .getProducts(filterQuery)
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .finally(() => setIsLoading(false));
  }, [searchParams]);

  const handleFilterChange = (key: string, value: any) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === '' || value === false || value === undefined) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute active filters for tag chips
  const activeFilters = [
    searchQuery ? { key: 'search', label: `Search: "${searchQuery}"` } : null,
    selectedLeague ? { key: 'league', label: `League: ${selectedLeague}` } : null,
    selectedTeam ? { key: 'team', label: `Team: ${selectedTeam}` } : null,
    selectedCountry ? { key: 'country', label: `Country: ${selectedCountry}` } : null,
    selectedType ? { key: 'type', label: `Edition: ${selectedType}` } : null,
    selectedSize ? { key: 'size', label: `Size: ${selectedSize}` } : null,
    maxPrice < 8000 ? { key: 'maxPrice', label: `Max: ₹${maxPrice.toLocaleString('en-IN')}` } : null,
    inStockOnly ? { key: 'inStock', label: 'In Stock Only' } : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  // Page title based on active filter
  const pageTitle = selectedType
    ? selectedType.toUpperCase()
    : selectedLeague
    ? selectedLeague.toUpperCase()
    : selectedTeam
    ? selectedTeam.toUpperCase()
    : 'ALL MATCH KITS';

  // Quick type filter pills
  const typePills = ['All', ...types.slice(0, 7)];
  const ALL_SIZES: JerseySize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const PRICE_RANGES = [
    { label: 'All Prices', max: 8000 },
    { label: 'Under ₹2,500', max: 2500 },
    { label: 'Under ₹4,000', max: 4000 },
    { label: 'Under ₹6,000', max: 6000 },
  ];

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      <div className="w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        {/* ── Collection Header ── */}
        <div className="pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#FF5722] uppercase tracking-widest font-mono">
              MATCHWEAR CATALOGUE
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-[42px] sm:text-[56px] lg:text-[64px] font-normal text-black font-display uppercase tracking-tight leading-none mt-1"
            >
              {pageTitle}
            </motion.h1>
          </div>
          <p className="text-xs text-neutral-400 font-medium">
            Showing <strong className="text-black">{pagination.total}</strong> authentic kits
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 pb-6 border-b border-neutral-200">
          {/* Type pill filters */}
          <div className="flex flex-wrap items-center gap-2">
            {typePills.map((pill) => {
              const isActive = pill === 'All' ? !selectedType : selectedType === pill;
              return (
                <motion.button
                  key={pill}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleFilterChange('type', pill === 'All' ? '' : pill)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border transition-all font-sans ${
                    isActive
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-black'
                  }`}
                >
                  {pill}
                </motion.button>
              );
            })}

            {/* Mobile filter toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-4 py-2 border border-neutral-300 hover:border-black text-xs font-semibold text-black uppercase tracking-wider rounded-full transition-colors font-sans"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-[#FF5722] text-white text-[9px] font-bold rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Right: sort */}
          <div className="flex items-center gap-4">
            <SortDropdown sortBy={sortBy} onSortChange={(val) => handleFilterChange('sortBy', val)} />
          </div>
        </div>

        {/* ── Secondary Filter Row: Size / Price / Availability (desktop) ── */}
        <div className="hidden md:flex flex-wrap items-center gap-x-6 gap-y-3 py-4 border-b border-neutral-100">
          {/* Size */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-sans mr-1">
              Size
            </span>
            {ALL_SIZES.map((s) => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange('size', selectedSize === s ? '' : s)}
                className={`w-8 h-8 text-[10px] font-bold uppercase rounded-md border transition-all font-sans ${
                  selectedSize === s
                    ? 'bg-black text-white border-black shadow-xs'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-black'
                }`}
              >
                {s}
              </motion.button>
            ))}
          </div>

          <span className="w-px h-5 bg-neutral-200" />

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-sans">
              Max Price
            </span>
            <div className="relative">
              <select
                value={maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                className="appearance-none bg-neutral-50 border border-neutral-200 hover:border-black px-3 py-1.5 pr-7 text-xs font-semibold text-black rounded-md focus:outline-none cursor-pointer transition-colors font-sans"
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r.max} value={r.max}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="w-px h-5 bg-neutral-200" />

          {/* Availability */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => handleFilterChange('inStock', !inStockOnly)}
              className={`w-9 h-5 rounded-full transition-colors duration-200 relative cursor-pointer ${
                inStockOnly ? 'bg-black' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  inStockOnly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-black font-sans">
              In Stock Only
            </span>
          </label>
        </div>

        {/* ── Active Filter Chips ── */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 pt-4 pb-2"
            >
              {activeFilters.map((af) => (
                <motion.span
                  key={af.key}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-black text-xs font-semibold rounded-full border border-neutral-200 font-sans"
                >
                  {af.label}
                  <button
                    type="button"
                    onClick={() => handleFilterChange(af.key, '')}
                    className="p-0.5 hover:text-[#FF5722] transition-colors"
                    aria-label={`Remove ${af.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold uppercase tracking-wider text-[#FF5722] hover:underline font-sans ml-2"
              >
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Product Grid ── */}
        <div className="py-8 sm:py-10">
          {isLoading ? (
            /* Skeleton grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-[4/5] bg-neutral-100 rounded-lg animate-pulse" />
                  <div className="h-3.5 bg-neutral-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2" />
                  <div className="h-3.5 bg-neutral-100 rounded animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center space-y-5">
              <h3 className="text-3xl font-normal uppercase font-display">No Products Found</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto font-sans">
                No match kits found matching your active filter criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#FF5722] transition-colors font-sans shadow-md"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div className="pb-16 pt-6 flex items-center justify-between border-t border-neutral-200">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-6 py-3 border border-black text-xs font-bold uppercase tracking-wider rounded-full disabled:opacity-25 disabled:pointer-events-none hover:bg-black hover:text-white transition-colors font-sans"
            >
              ← Previous
            </motion.button>
            <span className="text-xs font-mono text-neutral-500 font-bold">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-6 py-3 border border-black text-xs font-bold uppercase tracking-wider rounded-full disabled:opacity-25 disabled:pointer-events-none hover:bg-black hover:text-white transition-colors font-sans"
            >
              Next →
            </motion.button>
          </div>
        )}
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <h3 className="font-bold text-sm uppercase tracking-wider font-sans">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>
              <FilterSidebar
                searchQuery={searchQuery}
                selectedTeam={selectedTeam}
                selectedCountry={selectedCountry}
                selectedType={selectedType}
                selectedSize={selectedSize}
                selectedLeague={selectedLeague}
                minPrice={1999}
                maxPrice={maxPrice}
                inStockOnly={inStockOnly}
                teams={teams}
                countries={countries}
                leagues={leagues}
                types={types}
                onFilterChange={(k, v) => {
                  handleFilterChange(k, v);
                  if (k !== 'search') setIsMobileFilterOpen(false);
                }}
                onReset={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
