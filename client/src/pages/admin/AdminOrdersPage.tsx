import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, Edit, Check, PackageCheck, MapPin, Sparkles, ExternalLink, Send } from 'lucide-react';
import { adminService, shippingService } from '../../services/api';
import { IOrder, OrderStatus } from '@shared/types';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { addToast } from '../../store/uiSlice';
import { useAppDispatch } from '../../store';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');
  const [isGeneratingAwb, setIsGeneratingAwb] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const loadOrders = () => {
    adminService
      .getOrders({ limit: 50 })
      .then((res) => setOrders(res.data.orders))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleGenerateAwb = async (orderId: string) => {
    setIsGeneratingAwb(orderId);
    try {
      const res = await shippingService.generateAWB(orderId);
      dispatch(addToast({ type: 'success', message: `AWB Generated: ${res.data.data.shipment.awbNumber}` }));
      loadOrders();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to generate AWB.' }));
    } finally {
      setIsGeneratingAwb(null);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await adminService.updateOrderStatus(selectedOrder._id, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        note: note || undefined,
      });

      dispatch(addToast({ type: 'success', message: 'Order fulfillment status updated!' }));
      setSelectedOrder(null);
      loadOrders();
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update order.' }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-black font-display uppercase tracking-tight">
          ORDERS & INDIA-WIDE FULFILLMENT
        </h2>
        <p className="text-xs text-gray-500 font-medium">
          Manage matchwear orders, dispatch BlueDart/Shiprocket AWBs, and monitor courier profit margins
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="text-[10px] uppercase font-bold bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-4">Order / Customer</th>
                <th className="p-4">Delivery PIN & City</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Shipping / Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4">AWB & Tracking</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const addr = order.shippingAddress;
                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-mono font-bold text-black">{order.orderNumber}</p>
                      <p className="text-[11px] text-gray-500 font-semibold">{addr?.fullName || 'Customer'}</p>
                    </td>
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-1.5 text-black">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5722]" />
                        <span>{addr?.city || 'Mumbai'}, {addr?.pincode || addr?.postalCode || '400001'}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
                        {addr?.address || addr?.street}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.paymentMethod === 'COD'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-green-50 text-green-800 border border-green-200'
                      }`}>
                        {order.paymentMethod}
                      </span>
                      <p className="text-[11px] font-mono font-bold text-black mt-1">
                        ₹{order.grandTotal.toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      <div>
                        Customer Paid: <strong>₹{order.pricing?.shipping ?? order.shipping}</strong>
                      </div>
                      <div className="text-gray-400 text-[10px]">
                        Courier Cost: ₹{order.pricing?.courierCost || 64}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'Shipped' || order.orderStatus === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      {order.trackingNumber ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-black">{order.trackingNumber}</span>
                          <a
                            href={`https://www.bluedart.com/tracking?awb=${order.trackingNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-black"
                            title="Open Courier Tracking"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateAwb(order._id)}
                          disabled={isGeneratingAwb === order._id}
                          className="px-2.5 py-1 bg-black hover:bg-gray-800 text-white text-[10px] font-bold uppercase rounded-md transition-colors disabled:opacity-50"
                        >
                          {isGeneratingAwb === order._id ? 'Generating...' : '⚡ Generate AWB'}
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.orderStatus);
                          setTrackingNumber(order.trackingNumber || '');
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-black transition-colors"
                        title="Edit Status"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Update Order: ${selectedOrder.orderNumber}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-black mb-1.5">
                Fulfillment Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-xs text-black font-semibold focus:border-black focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped (In Transit)</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <Input
              label="Courier AWB Number"
              placeholder="e.g. BD198273491IN"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />

            <Input
              label="Status Update Note"
              placeholder="e.g. Dispatched via Air Express from Mumbai Hub"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-black hover:bg-gray-50 uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
