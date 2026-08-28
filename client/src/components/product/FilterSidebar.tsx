import React from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
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
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

const ALL_SIZES: JerseySize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

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
  onFilterChange,
  onReset,
}) => {
  const activeCount = [
    Boolean(searchQuery),
    Boolean(selectedTeam),
    Boolean(selectedCountry),
    Boolean(selectedLeague),
    Boolean(selectedType),
    Boolean(selectedSize),
    maxPrice < 8000,
    inStockOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-black text-black uppercase tracking-wider">
            Filter Catalog
          </h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#FF5722] text-white text-[10px] font-mono font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#FF5722] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* In-sidebar Search */}
      <div>
        <label className="text-xs font-black text-black uppercase tracking-wider block mb-2">
          Search Kits
        </label>
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="e.g. Madrid, Retro, R9..."
            className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-8 py-2 text-xs font-medium text-black focus:outline-none focus:border-black placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-2.5 text-gray-400 hover:text-black p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sizing Filter Matrix */}
      <div>
        <label className="text-xs font-black text-black uppercase tracking-wider block mb-2.5">
          Size
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {ALL_SIZES.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onFilterChange('size', isSelected ? '' : size)}
                className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-black text-white border-black shadow'
                    : 'bg-gray-50 text-gray-900 border-gray-300 hover:border-black hover:bg-gray-100'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* League / Competition Filter */}
      <div>
        <label className="text-xs font-black text-black uppercase tracking-wider block mb-2">
          League / Tournament
        </label>
        <select
          value={selectedLeague}
          onChange={(e) => onFilterChange('league', e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs font-medium text-black focus:outline-none focus:border-black cursor-pointer"
        >
          <option value="">All Leagues & Tournaments</option>
          {leagues.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Team Filter */}
      <div>
        <label className="text-xs font-black text-black uppercase tracking-wider block mb-2">
          Team / Club
        </label>
        <select
          value={selectedTeam}
          onChange={(e) => onFilterChange('team', e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs font-medium text-black focus:outline-none focus:border-black cursor-pointer"
        >
          <option value="">All Teams & Clubs</option>
          {teams.map((t) => (
            <option key={t.slug || t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Country Filter */}
      <div>
        <label className="text-xs font-black text-black uppercase tracking-wider block mb-2">
          National Team / Country
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => onFilterChange('country', e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs font-medium text-black focus:outline-none focus:border-black cursor-pointer"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c.code || c.name} value={c.name}>
              {c.flag ? `${c.flag} ` : ''}{c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Jersey Type Filter */}
      <div>
        <label className="text-xs font-black text-black uppercase tracking-wider block mb-2">
          Edition / Kit Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-xs font-medium text-black focus:outline-none focus:border-black cursor-pointer"
        >
          <option value="">All Kit Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between text-xs font-black text-black uppercase tracking-wider mb-2">
          <span>Max Price</span>
          <span className="font-mono text-[#FF5722] font-black">₹{maxPrice.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="1999"
          max="8000"
          step="500"
          value={maxPrice}
          onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
          className="w-full accent-[#FF5722] bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-gray-700 font-mono font-bold mt-1">
          <span>₹1,999</span>
          <span>₹8,000</span>
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="pt-3 border-t border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onFilterChange('inStock', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#FF5722] accent-[#FF5722] focus:ring-0 cursor-pointer"
          />
          <span className="text-xs font-black text-black uppercase tracking-wider">
            In Stock Only
          </span>
        </label>
      </div>
    </div>
  );
};
