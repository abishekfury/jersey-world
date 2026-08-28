import React from 'react';
import { IProduct } from '@shared/types';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { Sparkles } from 'lucide-react';

interface ProductGridProps {
  products: IProduct[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyMessage = 'No jerseys found matching your selected criteria.',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="bg-surface-200 border border-white/5 rounded-2xl p-4 space-y-4">
            <Skeleton className="w-full aspect-[4/5] rounded-xl" />
            <Skeleton className="w-2/3 h-4" />
            <Skeleton className="w-1/3 h-4" />
            <Skeleton className="w-full h-8" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-200 border border-white/10 rounded-2xl">
        <Sparkles className="w-12 h-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-1">No Match Found</h3>
        <p className="text-xs text-gray-400 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};
