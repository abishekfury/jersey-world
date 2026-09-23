import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService, categoryService } from '../services/api';
import { IProduct } from '@shared/types';
import { ProductCard } from '../components/product/ProductCard';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { SortDropdown } from '../components/product/SortDropdown';
import { SEO } from '../components/seo/SEO';

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
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 8000;
  const inStockOnly = searchParams.get('inStock') === 'true';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  // Fetch taxonomy metadata
  useEffect(() => {
    categoryService.getMetadata().then((res) => {
      setTeams(res.data.teams || []);
      setCountries(res.data.countries || []);
      setLeagues(res.data.leagues || []);
      setTypes(res.data.types || []);
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
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 8000 ? maxPrice : undefined,
      inStock: inStockOnly || undefined,
      sortBy,
      page,
      limit: 16,
    };

    productService
      .getProducts(filterQuery)
      .then((res) => {
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
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
    minPrice > 0 ? { key: 'minPrice', label: `From: ₹${minPrice.toLocaleString('en-IN')}` } : null,
    maxPrice < 8000 ? { key: 'maxPrice', label: `Up to: ₹${maxPrice.toLocaleString('en-IN')}` } : null,
    inStockOnly ? { key: 'inStock', label: 'In Stock Only' } : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  // Page title based on active filter
  const pageTitle = selectedType
    ? `${selectedType} Kits`
    : selectedLeague
    ? `${selectedLeague} Kits`
    : selectedTeam
    ? `${selectedTeam} Kits`
    : 'All Match Kits';

  // Quick category pills
  const quickCategories = ['All', 'Player Version', 'Home', 'Away', 'Third Kit', 'Retro', 'International'];

  const shopJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://goalza.vercel.app/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Shop',
          item: 'https://goalza.vercel.app/shop',
        },
        ...(selectedTeam || selectedLeague || selectedType
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: selectedTeam || selectedLeague || selectedType,
                item: `https://goalza.vercel.app/shop?${searchParams.toString()}`,
              },
            ]
          : []),
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${pageTitle} | GOALZA`,
      description: `Explore authentic ${pageTitle.toLowerCase()}, player editions, and AI Virtual Try-On at GOALZA.`,
      url: `https://goalza.vercel.app/shop`,
    },
  ];

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      <SEO
        title={`${pageTitle} — Football Kits & Matchwear`}
        description={`Explore authentic ${pageTitle.toLowerCase()}, fan & player editions, retro collections, and AI Virtual Try-On at GOALZA.`}
        keywords={`${pageTitle.toLowerCase()}, authentic football shirts, soccer kits, buy football jersey online india, player version jerseys, retro kits, goalza`}
        jsonLd={shopJsonLd}
      />

      <div className="w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        {/* ── Top Catalog Headline Bar ── */}
        <div className="pt-8 sm:pt-12 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-100">
          <div>
            <span className="text-xs font-bold text-[#FF5722] uppercase tracking-widest font-mono">
              OFFICIAL MATCHWEAR CATALOGUE
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl lg:text-6xl font-normal text-black font-display uppercase tracking-tight leading-none mt-1"
            >
              {pageTitle}
            </motion.h1>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs font-mono text-neutral-400 block uppercase tracking-wider">
              AUTHENTICITY GUARANTEED
            </span>
            <span className="text-xs text-neutral-600 font-medium">
              Free Shipping on Orders Above ₹1,499
            </span>
          </div>
        </div>

        {/* ── Top Toolbar (from Image 2): Product Count, Quick Filter Pills, Sort Dropdown ── */}
        <div className="py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Live Products Count (from Image 2) */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-neutral-700 font-sans">
              {pagination.total} products
            </span>

            {/* Mobile Filter Button with Count Badge */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 text-xs font-bold uppercase tracking-wider text-black hover:border-black transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FF5722] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Center: Quick Category Pills */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {quickCategories.map((cat) => {
              const isActive = cat === 'All' ? !selectedType : selectedType === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleFilterChange('type', cat === 'All' ? '' : cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer font-sans ${
                    isActive
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-black hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Right: Sort Dropdown (from Image 2) */}
          <div className="flex items-center gap-2 ml-auto">
            <SortDropdown sortBy={sortBy} onSortChange={(val) => handleFilterChange('sortBy', val)} />
          </div>
        </div>

        {/* ── Active Filter Chips Row ── */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 py-3 border-b border-neutral-100"
            >
              {activeFilters.map((af) => (
                <span
                  key={af.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-black text-xs font-semibold rounded-full border border-neutral-200 font-sans"
                >
                  {af.label}
                  <button
                    type="button"
                    onClick={() => handleFilterChange(af.key, '')}
                    className="p-0.5 hover:text-[#FF5722] transition-colors cursor-pointer"
                    aria-label={`Remove ${af.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold uppercase tracking-wider text-[#FF5722] hover:underline font-sans ml-2 cursor-pointer"
              >
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2-Column Catalog Body: Sticky Sidebar (Left) + Product Grid (Right) ── */}
        <div className="py-8 sm:py-10 flex gap-6 lg:gap-10 items-start">
          {/* Desktop Filter Sidebar (from Image 1 & 2) */}
          <aside className="hidden lg:block w-72 xl:w-80 2xl:w-[320px] flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-110px)] overflow-y-auto pr-1.5 custom-scrollbar">
            <FilterSidebar
              searchQuery={searchQuery}
              selectedTeam={selectedTeam}
              selectedCountry={selectedCountry}
              selectedType={selectedType}
              selectedSize={selectedSize}
              selectedLeague={selectedLeague}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              teams={teams}
              countries={countries}
              leagues={leagues}
              types={types}
              totalProductsCount={pagination.total}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Product Grid Stage (from Image 1 & 2) */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              /* Skeleton Loader */
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4">
                    <div className="aspect-[4/5] bg-neutral-100 rounded-xl animate-pulse" />
                    <div className="h-3.5 bg-neutral-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2" />
                    <div className="h-8 bg-neutral-100 rounded animate-pulse w-full mt-2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="py-24 text-center space-y-5 rounded-2xl border border-dashed border-neutral-300 p-8">
                <h3 className="text-3xl font-normal uppercase font-display">No Match Kits Found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto font-sans leading-relaxed">
                  We couldn't find any jerseys matching your active filters. Try clearing your filters or selecting a different club.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#FF5722] transition-colors font-sans shadow-md cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Modern Responsive Grid */
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            )}

            {/* ── Pagination ── */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 pt-6 pb-12 flex items-center justify-between border-t border-neutral-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-5 py-2.5 border border-neutral-300 text-xs font-bold uppercase tracking-wider rounded-lg disabled:opacity-30 disabled:pointer-events-none hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  ← Previous
                </motion.button>
                <span className="text-xs font-mono text-neutral-600 font-bold">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-5 py-2.5 border border-neutral-300 text-xs font-bold uppercase tracking-wider rounded-lg disabled:opacity-30 disabled:pointer-events-none hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  Next →
                </motion.button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer (Slide-over) ── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-black">
                  Filters
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 text-neutral-500 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <FilterSidebar
                  searchQuery={searchQuery}
                  selectedTeam={selectedTeam}
                  selectedCountry={selectedCountry}
                  selectedType={selectedType}
                  selectedSize={selectedSize}
                  selectedLeague={selectedLeague}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  inStockOnly={inStockOnly}
                  teams={teams}
                  countries={countries}
                  leagues={leagues}
                  types={types}
                  totalProductsCount={pagination.total}
                  onFilterChange={(key, val) => {
                    handleFilterChange(key, val);
                  }}
                  onReset={() => {
                    handleResetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                />
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                >
                  View {pagination.total} Products
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
