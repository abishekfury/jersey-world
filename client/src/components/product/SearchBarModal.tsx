import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSearchModalOpen } from '../../store/uiSlice';
import { productService } from '../../services/api';
import { IProduct } from '@shared/types';

export const SearchBarModal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.ui.isSearchModalOpen);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productService.getProducts({ search: searchTerm, limit: 5 });
        setSuggestions(res.data.products);
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectProduct = (product: IProduct) => {
    dispatch(setSearchModalOpen(false));
    navigate(`/shop/${product.slug || product._id}`);
  };

  const handleSearchSubmit = (term: string) => {
    dispatch(setSearchModalOpen(false));
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div
        className="fixed inset-0"
        onClick={() => dispatch(setSearchModalOpen(false))}
      />

      <div className="relative w-full max-w-xl z-10 space-y-4">
        {/* Floating Centered Search Pill (Matches Screenshot 5) */}
        <div className="relative flex items-center bg-white rounded-full shadow-2xl px-5 py-3.5 border border-gray-200">
          <Search className="w-4 h-4 text-gray-500 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm) {
                handleSearchSubmit(searchTerm);
              }
            }}
            autoFocus
            className="w-full bg-transparent text-sm text-black placeholder-gray-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-black p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-200 space-y-2 max-h-80 overflow-y-auto">
            {suggestions.map((item) => (
              <div
                key={item._id}
                onClick={() => handleSelectProduct(item)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <img
                  src={item.images.front}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-contain bg-gray-100 p-1"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-black">{item.name}</p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {item.team} • ₹{item.discountPrice || item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
