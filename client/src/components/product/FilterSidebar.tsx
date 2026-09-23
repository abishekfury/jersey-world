import React, { useState } from 'react';
import { Minus, Plus, RotateCcw, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JerseySize } from '@shared/types';

interface FilterSidebarProps {
  searchQuery?: string;
  selectedTeam: string;
  selectedCountry: string;
  selectedType: string;
  selectedSize: string;
  selectedLeague: string;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  teams: any[];
  countries: any[];
  leagues: string[];
  types: string[];
  totalProductsCount?: number;
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const ALL_SIZES: JerseySize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  searchQuery = '',
  selectedTeam,
  selectedCountry,
  selectedType,
  selectedSize,
  selectedLeague,
  minPrice,
  maxPrice,
  inStockOnly,
  teams,
  countries,
  leagues,
  types,
  totalProductsCount = 0,
  onFilterChange,
  onReset,
}) => {
  // Collapsible section states (all open by default)
  const [openSections, setOpenSections] = useState({
    availability: true,
    price: true,
    size: true,
    team: true,
    league: false,
  });

  const [fromPriceInput, setFromPriceInput] = useState(minPrice ? String(minPrice) : '');
  const [toPriceInput, setToPriceInput] = useState(maxPrice < 8000 ? String(maxPrice) : '');
  const [teamSearch, setTeamSearch] = useState('');

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceApply = () => {
    const min = fromPriceInput ? Math.max(0, Number(fromPriceInput)) : 0;
    const max = toPriceInput ? Math.min(8000, Number(toPriceInput)) : 8000;
    onFilterChange('minPrice', min > 0 ? min : undefined);
    onFilterChange('maxPrice', max < 8000 ? max : undefined);
  };

  const activeCount = [
    Boolean(searchQuery),
    Boolean(selectedTeam),
    Boolean(selectedCountry),
    Boolean(selectedLeague),
    Boolean(selectedType),
    Boolean(selectedSize),
    minPrice > 0,
    maxPrice < 8000,
    inStockOnly,
  ].filter(Boolean).length;

  const filteredTeams = teams.filter((t) =>
    (t.name || '').toLowerCase().includes(teamSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-6 text-black font-sans select-none">
      {/* Top Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-black">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#FF5722] text-white text-[10px] font-mono font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-[#FF5722] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* 1. AVAILABILITY SECTION (from Image 1 & 2) */}
      <div className="border-b border-neutral-200 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('availability')}
          className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 group-hover:text-[#FF5722] transition-colors">
            Availability
          </span>
          <span className="text-neutral-500 group-hover:text-black">
            {openSections.availability ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {openSections.availability && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-3 space-y-2.5"
            >
              <label className="flex items-center justify-between text-xs text-neutral-800 cursor-pointer hover:text-black select-none group py-1">
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={() => onFilterChange('inStock', !inStockOnly ? 'true' : '')}
                    className={`w-4 h-4 rounded border transition-colors flex items-center justify-center cursor-pointer ${
                      inStockOnly ? 'bg-black border-black text-white' : 'border-neutral-300 bg-white group-hover:border-black'
                    }`}
                  >
                    {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-semibold text-neutral-800">In stock</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-mono font-medium">
                  {totalProductsCount > 0 ? totalProductsCount : '93'}
                </span>
              </label>

              <label className="flex items-center justify-between text-xs text-neutral-800 cursor-pointer hover:text-black select-none group py-1">
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={() => onFilterChange('inStock', inStockOnly ? '' : 'false')}
                    className="w-4 h-4 rounded border border-neutral-300 bg-white group-hover:border-black flex items-center justify-center cursor-pointer"
                  >
                  </div>
                  <span className="font-medium text-neutral-500">Out of stock</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400 text-xs font-mono">0</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. PRICE FILTER SECTION (from Image 1 & 2) */}
      <div className="border-b border-neutral-200 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 group-hover:text-[#FF5722] transition-colors">
            Price
          </span>
          <span className="text-neutral-500 group-hover:text-black">
            {openSections.price ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {openSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-3 space-y-3"
            >
              <p className="text-[11px] text-neutral-500 font-medium">
                The highest price is <strong className="text-black font-semibold">₹8,000.00</strong>
              </p>

              {/* Range Slider */}
              <div className="py-1">
                <input
                  type="range"
                  min="0"
                  max="8000"
                  step="250"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setToPriceInput(val < 8000 ? String(val) : '');
                    onFilterChange('maxPrice', val < 8000 ? val : undefined);
                  }}
                  className="w-full accent-[#FF5722] bg-neutral-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Numeric Inputs: From / To */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="From"
                    value={fromPriceInput}
                    onChange={(e) => setFromPriceInput(e.target.value)}
                    onBlur={handlePriceApply}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
                    className="w-full h-9 pl-6 pr-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="To"
                    value={toPriceInput}
                    onChange={(e) => setToPriceInput(e.target.value)}
                    onBlur={handlePriceApply}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
                    className="w-full h-9 pl-6 pr-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. SIZE FILTER SECTION (3-Column Roomy Grid) */}
      <div className="border-b border-neutral-200 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 group-hover:text-[#FF5722] transition-colors">
            Size
          </span>
          <span className="text-neutral-500 group-hover:text-black">
            {openSections.size ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {openSections.size && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-3"
            >
              {/* 3-Column Roomy Grid Matrix */}
              <div className="grid grid-cols-3 gap-2">
                {ALL_SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onFilterChange('size', isSelected ? '' : size)}
                      className={`h-11 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer font-mono ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-xs ring-1 ring-black'
                          : 'bg-white text-neutral-800 border-neutral-200 hover:border-black hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-xs font-extrabold leading-none">{size}</span>
                      <span className={`text-[9px] font-normal leading-tight mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        (100+)
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. TEAMS / CLUBS FILTER SECTION */}
      <div className="border-b border-neutral-200 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('team')}
          className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 group-hover:text-[#FF5722] transition-colors">
            Clubs & Teams
          </span>
          <span className="text-neutral-500 group-hover:text-black">
            {openSections.team ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {openSections.team && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-3 space-y-2.5"
            >
              {/* Search Clubs */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clubs & teams..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full h-9 pl-8 pr-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {/* Scrollable Team List */}
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => onFilterChange('team', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    !selectedTeam ? 'bg-neutral-100 font-bold text-black' : 'text-neutral-600 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  <span>All Clubs</span>
                </button>

                {filteredTeams.map((t) => {
                  const isSelected = selectedTeam === t.name;
                  return (
                    <button
                      key={t._id || t.name}
                      type="button"
                      onClick={() => onFilterChange('team', isSelected ? '' : t.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-black text-white font-bold' : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                      }`}
                    >
                      <span className="truncate">{t.name}</span>
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. LEAGUES & TOURNAMENTS SECTION */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection('league')}
          className="w-full flex items-center justify-between py-1 text-left group cursor-pointer"
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 group-hover:text-[#FF5722] transition-colors">
            Leagues & Competitions
          </span>
          <span className="text-neutral-500 group-hover:text-black">
            {openSections.league ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {openSections.league && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-3 space-y-1"
            >
              <button
                type="button"
                onClick={() => onFilterChange('league', '')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                  !selectedLeague ? 'bg-neutral-100 font-bold text-black' : 'text-neutral-600 hover:text-black hover:bg-neutral-50'
                }`}
              >
                <span>All Leagues</span>
              </button>

              {leagues.map((l) => {
                const isSelected = selectedLeague === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onFilterChange('league', isSelected ? '' : l)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected ? 'bg-black text-white font-bold' : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                    }`}
                  >
                    <span>{l}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
