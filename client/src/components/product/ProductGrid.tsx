import React from 'react';
import { IProduct } from '@shared/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { Sparkles } from 'lucide-react';

interface ProductGridProps {
  products: IProduct[];
  isLoading?: boolean;
  emptyMessage?: string;
  onQuickView?: (product: IProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyMessage = 'No jerseys found matching your selected criteria.',
  onQuickView,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="flex flex-col items-center space-y-3 p-2">
            <Skeleton className="w-full aspect-[4/5] rounded" />
            <Skeleton className="w-3/4 h-3 rounded" />
            <Skeleton className="w-1/2 h-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-neutral-50 rounded-lg">
        <Sparkles className="w-10 h-10 text-neutral-400 mb-3" />
        <h3 className="text-base font-bold text-neutral-900 mb-1 uppercase tracking-wide">No Jerseys Found</h3>
        <p className="text-xs text-neutral-500 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product, idx) => (
        <ProductCard
          key={product._id || idx}
          product={product}
          index={idx}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};
