import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { orderService } from '../services/api';
import { IOrder } from '@shared/types';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/seo/SEO';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#CCFF00', '#FACC15', '#00F0FF', '#FFFFFF'],
    });

    if (orderId) {
      orderService.getOrderById(orderId).then((res) => {
        setOrder(res.data.order);
      });
    }
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <SEO title="Order Confirmed" noIndex={true} />
      <div className="w-20 h-20 mx-auto rounded-3xl bg-neon-lime/20 border-2 border-neon-lime flex items-center justify-center text-neon-lime shadow-[0_0_30px_rgba(204,255,0,0.5)]">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
          PAYMENT CONFIRMED!
        </h1>
        <p className="text-sm text-gray-300">
          Thank you for your order. We’re preparing your matchwear for express dispatch.
        </p>
      </div>

      {order && (
        <div className="bg-surface-200 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400">Order Number</span>
              <p className="text-sm font-bold text-neon-lime font-mono">{order.orderNumber}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400">Tracking Code</span>
              <p className="text-sm font-bold text-white font-mono">{order.trackingNumber || 'TRK-EXP-PENDING'}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400">Total Paid</span>
              <p className="text-sm font-bold text-white font-mono">₹{order.grandTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-gray-400 font-mono">Items In Shipment</h4>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-14 object-contain bg-surface-300 rounded-lg p-1"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.productName}</h5>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                    {item.customization?.playerName && (
                      <p className="text-[10px] text-neon-lime font-mono">
                        #{item.customization.playerNumber} {item.customization.playerName}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-surface-100/60 rounded-2xl border border-white/5 flex items-center gap-3 text-xs text-gray-400">
            <Truck className="w-5 h-5 text-neon-cyan shrink-0" />
            <div>
              <p className="text-white font-semibold">Delivery Address</p>
              <p>
                {order.shippingAddress.fullName}, {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/account/orders"
          className="w-full sm:w-auto px-6 py-3.5 bg-surface-100 hover:bg-surface-50 border border-white/10 text-white font-bold text-xs rounded-xl transition-colors"
        >
          VIEW IN MY ORDERS
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-8 py-3.5 bg-neon-lime text-black font-bold text-xs rounded-xl shadow-lg hover:bg-neon-lime/90"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
};
