import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (val: any) => void;
  className?: string;
  minWidth?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onChange,
  className = '',
  minWidth = 'min-w-[180px]',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((opt) => String(opt.value) === String(value)) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left font-sans ${className}`}>
      {/* Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${minWidth} flex items-center justify-between bg-white border px-3.5 py-1.5 rounded-lg transition-all text-left shadow-xs cursor-pointer select-none ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-100 rounded-b-none'
            : 'border-neutral-300 hover:border-neutral-400'
        }`}
      >
        <div className="flex flex-col text-left">
          <span className="text-[11px] text-neutral-500 font-sans leading-tight">
            {label}
          </span>
          <span className="text-xs font-bold text-neutral-900 font-sans leading-tight mt-0.5">
            {selectedOption?.label || ''}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-black transition-transform duration-200 ml-3 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Options Dropdown List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full bg-white border-x border-b border-neutral-300 shadow-2xl z-50 rounded-b-lg overflow-hidden max-h-64 overflow-y-auto"
          >
            <div className="py-0 divide-y divide-neutral-100">
              {options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors block cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E2D42] text-white font-normal'
                        : 'bg-white text-neutral-800 hover:bg-neutral-100 font-normal'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

