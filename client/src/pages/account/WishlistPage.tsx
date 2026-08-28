import React from 'react';
import { Heart } from 'lucide-react';
import { useAppSelector } from '../../store';
import { ProductCard } from '../../components/product/ProductCard';

export const WishlistPage: React.FC = () => {
  const wishlist = useAppSelector((state) => state.wishlist.items);

  if (wishlist.length === 0) {
    return (
      <div className="bg-surface-200 border border-white/10 rounded-3xl p-12 text-center space-y-4">
        <Heart className="w-12 h-12 text-gray-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Your Wishlist is Empty</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Tap the heart icon on any football jersey to save items to your wishlist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-display uppercase tracking-wider">
          Saved Jerseys Wishlist
        </h2>
        <span className="text-xs font-mono text-gray-400">{wishlist.length} Items</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};
