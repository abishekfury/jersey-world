import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Shirt,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  Truck,
} from 'lucide-react';
import { adminService, shippingService } from '../../services/api';
import { addToast } from '../../store/uiSlice';
import { useAppDispatch } from '../../store';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingSettings, setShippingSettings] = useState<any>({
    enableShipping: true,
    freeShippingThreshold: 1499,
    defaultShippingCharge: 79,
    enableCod: true,
    codFee: 25,
    activeProvider: 'mock',
    pickupPincode: '400001',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      shippingService.getSettings(),
    ])
      .then(([dashRes, shipRes]: [any, any]) => {
        setData(dashRes.data);
        if (shipRes.data?.data?.settings) {
          setShippingSettings(shipRes.data.data.settings);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveShippingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await shippingService.updateSettings(shippingSettings);
      dispatch(addToast({ type: 'success', message: 'Shipping rules and thresholds updated!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update shipping rules.' }));
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts } = data;

  const kpis = [
    {
      label: 'TOTAL SALES REVENUE',
      value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: <DollarSign className="w-6 h-6 text-black" />,
      change: '+22.5% vs last month',
    },
    {
      label: 'TOTAL STORE ORDERS',
      value: stats.totalOrders || 0,
      icon: <ShoppingBag className="w-6 h-6 text-black" />,
      change: `${stats.totalOrders || 0} customer orders placed`,
    },
    {
      label: 'ACTIVE FOOTBALL KITS',
      value: stats.totalProducts || 0,
      icon: <Shirt className="w-6 h-6 text-black" />,
      change: '100% in-stock inventory',
    },
    {
      label: 'AVG ORDER VALUE',
      value: `₹${Math.round((stats.totalRevenue || 0) / (stats.totalOrders || 1)).toLocaleString('en-IN')}`,
      icon: <TrendingUp className="w-6 h-6 text-[#FF5722]" />,
      change: 'Calculated across all orders',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black font-display uppercase tracking-tight">
            EXECUTIVE DASHBOARD & SALES
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Live revenue metrics, fulfillment operations, and India-wide courier dispatch status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF5722] hover:bg-[#e04816] text-white text-xs font-bold uppercase rounded-xl transition-all shadow"
          >
            <Plus className="w-4 h-4" /> Add Match Kit
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-3 hover:border-black transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 font-mono tracking-wider">
                {kpi.label}
              </span>
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                {kpi.icon}
              </div>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-black font-mono tracking-tight">{kpi.value}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">{kpi.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping & Delivery Engine Configuration */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#FF5722]" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-black uppercase tracking-wider">
                India-Wide Shipping & Delivery Rules
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Configure free shipping thresholds, COD fees, and courier provider rules
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold uppercase px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg">
            ✓ Active Logistics Engine
          </span>
        </div>

        <form onSubmit={handleSaveShippingSettings} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-bold text-black uppercase mb-2">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              value={shippingSettings.freeShippingThreshold}
              onChange={(e) =>
                setShippingSettings({ ...shippingSettings, freeShippingThreshold: Number(e.target.value) })
              }
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black font-bold font-mono focus:border-black focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Orders at or above get Free Delivery</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-black uppercase mb-2">
              Standard Shipping Fee (₹)
            </label>
            <input
              type="number"
              value={shippingSettings.defaultShippingCharge}
              onChange={(e) =>
                setShippingSettings({ ...shippingSettings, defaultShippingCharge: Number(e.target.value) })
              }
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black font-bold font-mono focus:border-black focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Base rate for orders under threshold</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-black uppercase mb-2">
              Cash on Delivery (COD) Fee (₹)
            </label>
            <input
              type="number"
              value={shippingSettings.codFee}
              onChange={(e) =>
                setShippingSettings({ ...shippingSettings, codFee: Number(e.target.value) })
              }
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black font-bold font-mono focus:border-black focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Doorstep carrier fee</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-black uppercase mb-2">
              Active Courier Provider
            </label>
            <select
              value={shippingSettings.activeProvider}
              onChange={(e) =>
                setShippingSettings({ ...shippingSettings, activeProvider: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black font-bold focus:border-black focus:outline-none"
            >
              <option value="mock">BlueDart Express Simulator</option>
              <option value="shiprocket">Shiprocket API Engine</option>
            </select>
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Pluggable shipping gateway</p>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-6 py-3 bg-black hover:bg-[#FF5722] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
            >
              {isSavingSettings ? 'Saving...' : 'Save Shipping Rules'}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Grid: Recent Orders & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-display font-black text-base text-black uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF5722]" />
              Recent Store Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 uppercase"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase font-bold text-gray-500 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 font-bold text-black font-mono text-sm">{ord.orderNumber}</td>
                    <td className="p-3.5 font-semibold text-black text-sm">{ord.user?.name || 'Customer'}</td>
                    <td className="p-3.5 font-bold text-black font-mono text-base">
                      ₹{ord.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase bg-green-50 text-green-700 border border-green-200">
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-display font-black text-base text-black uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF5722]" />
              Low Stock Alerts
            </h3>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-gray-600 hover:text-black uppercase"
            >
              Restock →
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center italic">All inventory levels healthy</p>
            ) : (
              lowStockProducts.map((p: any) => (
                <div key={p._id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#ECEAE4] rounded-xl p-1 flex items-center justify-center shrink-0 border border-gray-200">
                      <img
                        src={p.images?.front}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="truncate pr-2">
                      <h5 className="text-sm font-bold text-black truncate">{p.name}</h5>
                      <span className="text-xs text-gray-500 font-medium">{p.team}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded-lg shrink-0">
                    {p.totalStock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

