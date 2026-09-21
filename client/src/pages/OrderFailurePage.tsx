import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  XCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  CreditCard,
  PhoneCall,
} from 'lucide-react';
import { orderService } from '../services/api';
import { IOrder } from '@shared/types';
import { SEO } from '../components/seo/SEO';

export const OrderFailurePage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orderId && orderId !== 'unknown') {
      setIsLoading(true);
      orderService
        .getOrderById(orderId)
        .then((res) => {
          if (res.data?.order) {
            setOrder(res.data.order);
          }
        })
        .catch(() => {
          // Non-blocking fallback
        })
        .finally(() => setIsLoading(false));
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans pb-24">
      <SEO title="Payment Incomplete or Cancelled" noIndex={true} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-10 text-center space-y-6">
          {/* Failure Icon */}
          <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto ring-8 ring-red-50/50">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-red-600 font-bold block">
              TRANSACTION INCOMPLETE / CANCELLED
            </span>
            <h1 className="text-2xl sm:text-3xl font-normal font-display uppercase tracking-tight text-black">
              Payment Could Not Be Processed
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto font-sans leading-relaxed">
              Your transaction was not completed. If money was debited from your bank account or card, it will be automatically refunded within 3-5 business days.
            </p>
          </div>

          {/* Order Snapshot if available */}
          {order && (
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left space-y-3 max-w-md mx-auto">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-200">
                <span className="text-neutral-500 font-mono">Order Reference:</span>
                <span className="font-mono font-bold text-black">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-200">
                <span className="text-neutral-500">Total Amount:</span>
                <span className="font-mono font-bold text-black">₹{order.pricing?.total || order.grandTotal}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Payment Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase text-[10px]">
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full sm:w-auto px-6 py-3.5 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Payment</span>
            </button>

            <Link
              to="/cart"
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Return to Cart</span>
            </Link>
          </div>

          {/* Helpful Support Footer */}
          <div className="pt-6 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50">
              <ShieldAlert className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-neutral-600">
                <strong className="block text-black font-semibold">Bank Deducted?</strong>
                Banks automatically reverse failed gateway charges in 3-5 working days.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50">
              <PhoneCall className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-neutral-600">
                <strong className="block text-black font-semibold">Need Assistance?</strong>
                Contact support at <strong>support@jerseyworld.com</strong> or WhatsApp helpdesk.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

