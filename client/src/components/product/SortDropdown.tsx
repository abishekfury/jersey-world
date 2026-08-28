import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (val: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="relative flex items-center">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="appearance-none bg-white border border-neutral-300 hover:border-black px-4 py-2 pr-8 text-xs font-semibold text-black focus:outline-none focus:border-black cursor-pointer transition-colors font-sans uppercase tracking-wider"
      >
        <option value="featured">Featured</option>
        <option value="newest">Newest</option>
        <option value="popular">Most Popular</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-black absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
