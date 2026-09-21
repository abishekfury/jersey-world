import React, { useEffect, useState } from 'react';
import { Star, Trash2, ShieldCheck, Search, Filter, MessageSquare, AlertTriangle, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/api';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/uiSlice';
import { SEO } from '../../components/seo/SEO';

export const AdminReviewsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getReviews();
      setReviews(res.data.reviews || []);
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to load reviews.' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to remove this review? The product average rating will be recalculated.')) {
      return;
    }

    try {
      await adminService.deleteReview(reviewId);
      dispatch(addToast({ type: 'success', message: 'Review removed and product rating recalculated.' }));
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete review.' }));
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'all' || r.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      <SEO title="Admin Review Moderation" noIndex={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal font-display uppercase tracking-tight text-black">
            CUSTOMER REVIEWS MODERATION
          </h1>
          <p className="text-xs text-neutral-500 font-sans mt-0.5">
            Manage verified buyer feedback, ratings, and customer product impressions.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, jersey, or keyword..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black focus:outline-none"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black focus:outline-none"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-neutral-400">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-neutral-200 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-700">No Reviews Found</h3>
          <p className="text-xs text-neutral-400">No customer reviews match your current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-300 fill-neutral-200'}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-black ml-1.5">{review.rating}.0</span>
                  </div>

                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Buyer
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-black">{review.title}</h4>
                  <p className="text-xs text-neutral-600 font-sans mt-1 leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              </div>

              {/* Product and Reviewer Meta */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-black block">{review.user?.name || 'Customer'}</span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Jersey: <strong className="text-neutral-700">{review.product?.name || 'Item'}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remove review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

