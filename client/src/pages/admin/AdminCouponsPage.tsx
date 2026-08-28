import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, CheckCircle, XCircle, AlertCircle, Percent, DollarSign } from 'lucide-react';
import { adminService } from '../../services/api';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/uiSlice';

export const AdminCouponsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 0,
    maxDiscountAmount: 1000,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    userUsageLimit: 1,
    active: true,
  });

  const loadCoupons = () => {
    setIsLoading(true);
    adminService
      .getCoupons()
      .then((res: any) => {
        setCoupons(res.data.coupons || []);
      })
      .catch((err) => {
        console.error('Failed to load coupons:', err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 0,
      maxDiscountAmount: 1000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: 100,
      userUsageLimit: 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || coupon.discountPercent || 10,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 1000,
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || 100,
      userUsageLimit: coupon.userUsageLimit || 1,
      active: coupon.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, formData);
        dispatch(addToast({ type: 'success', message: 'Coupon updated successfully!' }));
      } else {
        await adminService.createCoupon(formData);
        dispatch(addToast({ type: 'success', message: 'Coupon created successfully!' }));
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          message: err.response?.data?.message || 'Failed to save coupon.',
        })
      );
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      await adminService.deleteCoupon(id);
      dispatch(addToast({ type: 'success', message: `Coupon "${code}" deleted.` }));
      loadCoupons();
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          message: err.response?.data?.message || 'Failed to delete coupon.',
        })
      );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black font-display uppercase tracking-tight">
            Coupons & Promotional Discounts
          </h1>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Create and manage promotional discount codes and cart limits
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading discount coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Tag className="w-8 h-8 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-bold text-black">No coupons created yet</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Create coupons like <span className="font-mono font-bold">#FABFIT25</span> or seasonal discounts for your customers.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-lg hover:bg-[#FF5722] transition-colors"
            >
              Add First Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Usage (Used/Limit)</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-xs text-black bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-md">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-black font-sans">
                        {c.discountType === 'percentage' ? (
                          <>
                            <span>{c.discountValue || c.discountPercent}% OFF</span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              (Max ₹{c.maxDiscountAmount || '∞'})
                            </span>
                          </>
                        ) : (
                          <span>₹{c.discountValue} FLAT OFF</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-neutral-700">₹{c.minOrderAmount || 0}</td>
                    <td className="p-4 font-mono text-neutral-700">
                      {c.usedCount || 0} / {c.usageLimit || 'Unlimited'}
                    </td>
                    <td className="p-4 font-mono text-neutral-500">
                      {new Date(c.validUntil).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      {c.active !== false ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-bold text-[10px] border border-neutral-200">
                          <XCircle className="w-3 h-3" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-base text-black font-display uppercase">
                {editingCoupon ? 'Edit Coupon' : 'Create New Promotional Coupon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-black text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-neutral-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FABFIT25 or WELCOME10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg uppercase font-mono font-bold focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:border-black font-sans"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Discount Value ({formData.discountType === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formData.discountType === 'percentage' ? 100 : 10000}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-black focus:ring-black"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-black select-none">
                  Enable and activate this coupon immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-[#FF5722] text-white font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

