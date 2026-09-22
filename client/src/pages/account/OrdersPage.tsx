import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { orderService } from '../../services/api';
import { IOrder } from '@shared/types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then((res) => setOrders(res.data.orders))
      .finally(() => setIsLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Delivered':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-200">
            {status}
          </span>
        );
      case 'Shipped':
      case 'Out for Delivery':
      case 'Processing':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            {status}
          </span>
        );
      case 'Cancelled':
      case 'Refunded':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="w-full h-40 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8 text-black" />
        </div>
        <h3 className="text-lg font-bold text-black font-display uppercase">No Orders Placed Yet</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Explore our collection of authentic football jerseys and place your first order with India-wide express delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black font-display uppercase tracking-wider">
          Your Order & Delivery History
        </h2>
        <span className="text-xs font-mono font-bold text-gray-500">{orders.length} Orders</span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const addr = order.shippingAddress;
          return (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 transition-all hover:shadow-md"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">
                    Order Number
                  </span>
                  <p className="text-sm font-black text-black font-mono tracking-tight">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">Date</span>
                  <p className="text-xs text-gray-700 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">
                    Payment ({order.paymentMethod})
                  </span>
                  <p className="text-sm font-bold text-black font-mono">
                    ₹{order.grandTotal.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>{getStatusBadge(order.orderStatus)}</div>
              </div>

              {/* Courier & AWB Tracking Strip */}
              {order.trackingNumber ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                      <Truck className="w-4 h-4 text-[#FF5722]" />
                    </div>
                    <div>
                      <p className="font-bold text-black flex items-center gap-1.5">
                        {order.trackingCourier || 'BlueDart Air Express'}
                        <span className="font-mono text-gray-500 font-normal">
                          • AWB: <strong>{order.trackingNumber}</strong>
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Destination: {addr.city} ({addr.pincode || addr.postalCode || 'India'})
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://www.bluedart.com/tracking?awb=${order.trackingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white text-[11px] font-bold uppercase rounded-lg hover:bg-gray-800 transition-colors shrink-0"
                  >
                    Track Package <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Order is being packed at Mumbai warehouse. AWB tracking number will be generated shortly.</span>
                </div>
              )}

              {/* Items in order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-14 object-contain bg-[#ECEAE4] rounded p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-black text-xs truncate">{item.productName}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Size: {item.size} • Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Details */}
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Deliver to:</strong> {addr.fullName}, {addr.address || addr.street} {addr.apartment || ''}, {addr.city}, {addr.state} - {addr.pincode || addr.postalCode} • Mobile: {addr.phone}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
