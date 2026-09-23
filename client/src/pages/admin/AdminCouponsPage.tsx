import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, CheckCircle, XCircle, Sparkles, Image as ImageIcon, Flame, Copy, Check, ArrowUpRight, Upload } from 'lucide-react';
import { adminService, bannerService } from '../../services/api';
import { IOfferBanner } from '@shared/types';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/uiSlice';

export const AdminCouponsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'coupons' | 'banner'>('coupons');

  // Coupons State
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

  // Homepage Offer Banner & Hero State
  const [bannerData, setBannerData] = useState<IOfferBanner>({
    badgeText: 'LIMITED SEASON OFFER',
    discountHeadline: '45% OFF',
    description: 'Get an instant 45% discount on all matchwear & winter wear using the official promo code.',
    couponCode: 'FABFIT25',
    buttonText: 'Shop Sale',
    buttonLink: '/shop',
    leftImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85',
    rightImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85',
    isActive: true,
    heroTag: 'OFFICIAL 2026/27 COLLECTION',
    heroHeadline: 'WEAR THE PASSION.',
    heroSubheadline: 'OWN THE GLORY.',
    heroDescription:
      'Discover authentic club & international jerseys, official match kits, free express shipping, and seamless size exchanges.',
    heroBackgroundImage:
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=85',
  });
  const [isSavingBanner, setIsSavingBanner] = useState(false);

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

  const loadBanner = () => {
    bannerService
      .getBanner()
      .then((res) => {
        if (res.data?.banner) {
          setBannerData(res.data.banner);
        }
      })
      .catch((err) => console.error('Failed to load banner:', err));
  };

  useEffect(() => {
    loadCoupons();
    loadBanner();
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

  const handleSubmitCoupon = async (e: React.FormEvent) => {
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

  const handleDeleteCoupon = async (id: string, code: string) => {
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

  // Image Upload helper for banner and hero images
  const handleBannerImageUpload = async (
    key: 'leftImage' | 'rightImage' | 'heroBackgroundImage',
    file: File
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBannerData((prev) => ({
          ...prev,
          [key]: e.target?.result as string,
        }));
        dispatch(addToast({ type: 'success', message: 'Image loaded successfully!' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanner(true);
    try {
      await bannerService.updateBanner(bannerData);
      dispatch(addToast({ type: 'success', message: 'Homepage Offer Banner updated and live on store!' }));
      loadBanner();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update offer banner.' }));
    } finally {
      setIsSavingBanner(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black font-display uppercase tracking-tight">
            PROMOTIONS & STORE OFFERS
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage store-wide discount coupons and the dynamic Homepage Seasonal Offer Banner
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-neutral-200/70 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            Coupon Codes
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'banner'
                ? 'bg-[#FF5722] text-white shadow-xs'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Homepage Offer Banner
          </button>
        </div>
      </div>

      {/* ── TAB 1: COUPONS MANAGEMENT ── */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#FF5722] hover:bg-[#e04816] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Coupon</span>
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-neutral-400 font-medium">Loading discount coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-black font-display uppercase">No Coupons Configured</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Create coupons to reward customer loyalty with percentage discounts.
                </p>
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-xs">
                      <th className="p-4">Coupon Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Min. Spend</th>
                      <th className="p-4">Redemptions</th>
                      <th className="p-4">Valid Until</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {coupons.map((coupon) => (
                      <tr key={coupon._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-sm text-black bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-lg">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-black text-sm">
                          {coupon.discountType === 'percentage' ? (
                            <span>{coupon.discountValue || coupon.discountPercent}% OFF</span>
                          ) : (
                            <span>₹{coupon.discountValue} OFF</span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-neutral-700 text-sm">
                          {coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : 'No Min'}
                        </td>
                        <td className="p-4 text-neutral-700 text-sm font-mono">
                          {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                        </td>
                        <td className="p-4 text-neutral-700 text-xs font-mono">
                          {new Date(coupon.validUntil).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4">
                          {coupon.active !== false ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
                              <CheckCircle className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-md">
                              <XCircle className="w-3.5 h-3.5" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(coupon)}
                              className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-black transition-colors cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                              className="p-2 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* ── TAB 2: HOMEPAGE OFFER BANNER SETTINGS ── */}
      {activeTab === 'banner' && (
        <div className="space-y-8">
          {/* Live Preview Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5722]" /> Live Homepage Banner Preview
              </h3>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${bannerData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {bannerData.isActive ? '● Live on Store' : '○ Hidden on Store'}
              </span>
            </div>

            {/* Preview Container */}
            <div className="p-6 sm:p-10 bg-[#ECEAE4] rounded-3xl border border-neutral-300 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
                {/* Left Preview Image */}
                <div className="hidden lg:flex lg:col-span-3 justify-center items-center">
                  <img
                    src={bannerData.leftImage}
                    alt="Left Promo Preview"
                    className="w-full max-w-[200px] h-[260px] object-cover object-top rounded-2xl shadow-lg border border-neutral-300"
                  />
                </div>

                {/* Center Content */}
                <div className="lg:col-span-6 text-center space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black text-white text-[11px] font-bold tracking-widest uppercase">
                    <Flame className="w-3 h-3 text-[#FF5722]" /> {bannerData.badgeText}
                  </span>
                  <h2 className="text-4xl sm:text-6xl font-normal text-black font-display tracking-tight uppercase leading-none">
                    {bannerData.discountHeadline}
                  </h2>
                  <p className="text-xs text-neutral-700 font-medium max-w-sm mx-auto leading-relaxed">
                    {bannerData.description}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <div className="px-4 py-2 bg-white border-2 border-dashed border-black rounded-xl flex items-center gap-2 font-mono text-xs font-bold text-black shadow-xs">
                      <span>#{bannerData.couponCode}</span>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <div className="px-5 py-2.5 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-xs">
                      {bannerData.buttonText} <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Right Preview Image */}
                <div className="hidden lg:flex lg:col-span-3 justify-center items-center">
                  <img
                    src={bannerData.rightImage}
                    alt="Right Promo Preview"
                    className="w-full max-w-[200px] h-[260px] object-cover object-top rounded-2xl shadow-lg border border-neutral-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSaveBanner} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xs">
            {/* 1. HERO SECTION CUSTOMIZATION */}
            <div className="pb-6 border-b border-neutral-200 space-y-5">
              <div>
                <h3 className="text-base font-bold font-display uppercase tracking-wider text-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FF5722]" /> 1. Homepage Hero Banner & Backdrop
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Customize the main headline, subheadline, season badge, and stadium backdrop image on the Public Homepage
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Hero Season Badge Tag
                  </label>
                  <input
                    type="text"
                    value={bannerData.heroTag || ''}
                    onChange={(e) => setBannerData({ ...bannerData, heroTag: e.target.value })}
                    placeholder="e.g. OFFICIAL 2026/27 COLLECTION"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-xs font-mono font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Hero Main Headline
                  </label>
                  <input
                    type="text"
                    value={bannerData.heroHeadline || ''}
                    onChange={(e) => setBannerData({ ...bannerData, heroHeadline: e.target.value })}
                    placeholder="e.g. WEAR THE PASSION."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Hero Subheadline
                  </label>
                  <input
                    type="text"
                    value={bannerData.heroSubheadline || ''}
                    onChange={(e) => setBannerData({ ...bannerData, heroSubheadline: e.target.value })}
                    placeholder="e.g. OWN THE GLORY."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Hero Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={bannerData.heroDescription || ''}
                    onChange={(e) => setBannerData({ ...bannerData, heroDescription: e.target.value })}
                    placeholder="e.g. Discover authentic club & international jerseys..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-xs text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <label className="block text-xs font-bold uppercase text-black">
                    Hero Panoramic Stadium Backdrop Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img
                      src={bannerData.heroBackgroundImage || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2400&q=85'}
                      alt="Hero Backdrop Preview"
                      className="w-full sm:w-48 h-24 object-cover rounded-xl border border-neutral-300 shrink-0"
                    />
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={bannerData.heroBackgroundImage || ''}
                        onChange={(e) => setBannerData({ ...bannerData, heroBackgroundImage: e.target.value })}
                        placeholder="Paste backdrop web image URL..."
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[11px] font-bold uppercase rounded-lg hover:bg-neutral-800 cursor-pointer">
                        <Upload className="w-3 h-3" /> Upload Local Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleBannerImageUpload('heroBackgroundImage', e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PROMOTIONAL OFFER BANNER */}
            <div>
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-black pb-3 border-b border-neutral-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#FF5722]" /> 2. Homepage Promotional Offer Banner
              </h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Controls the mid-page promo section (with 1-click discount coupon copy and model photos)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Badge Text */}
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1.5">
                  Top Badge Text
                </label>
                <input
                  type="text"
                  required
                  value={bannerData.badgeText}
                  onChange={(e) => setBannerData({ ...bannerData, badgeText: e.target.value })}
                  placeholder="e.g. LIMITED SEASON OFFER"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-semibold text-black focus:border-black focus:outline-none"
                />
              </div>

              {/* Discount Headline */}
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1.5">
                  Discount Headline
                </label>
                <input
                  type="text"
                  required
                  value={bannerData.discountHeadline}
                  onChange={(e) => setBannerData({ ...bannerData, discountHeadline: e.target.value })}
                  placeholder="e.g. 45% OFF or FLASH SALE"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-black mb-1.5">
                  Offer Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={bannerData.description}
                  onChange={(e) => setBannerData({ ...bannerData, description: e.target.value })}
                  placeholder="e.g. Get an instant 45% discount on all matchwear & winter wear using the official promo code."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-medium text-black focus:border-black focus:outline-none"
                />
              </div>

              {/* Promo Code */}
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1.5">
                  Promo / Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={bannerData.couponCode}
                  onChange={(e) => setBannerData({ ...bannerData, couponCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. FABFIT25"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-black focus:border-black focus:outline-none uppercase"
                />
              </div>

              {/* Button Text & Link */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Button Label
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerData.buttonText}
                    onChange={(e) => setBannerData({ ...bannerData, buttonText: e.target.value })}
                    placeholder="e.g. Shop Sale"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Button Link
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerData.buttonLink}
                    onChange={(e) => setBannerData({ ...bannerData, buttonLink: e.target.value })}
                    placeholder="e.g. /shop"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono text-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Left Image Upload & URL */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <label className="block text-xs font-bold uppercase text-black">
                  Left Model Image
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={bannerData.leftImage}
                    alt="Left Preview"
                    className="w-14 h-18 object-cover rounded-xl border border-neutral-300 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={bannerData.leftImage}
                      onChange={(e) => setBannerData({ ...bannerData, leftImage: e.target.value })}
                      placeholder="Image URL"
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[11px] font-bold uppercase rounded-lg hover:bg-neutral-800 cursor-pointer">
                      <Upload className="w-3 h-3" /> Upload Local Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleBannerImageUpload('leftImage', e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Image Upload & URL */}
              <div className="space-y-2 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <label className="block text-xs font-bold uppercase text-black">
                  Right Model Image
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={bannerData.rightImage}
                    alt="Right Preview"
                    className="w-14 h-18 object-cover rounded-xl border border-neutral-300 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={bannerData.rightImage}
                      onChange={(e) => setBannerData({ ...bannerData, rightImage: e.target.value })}
                      placeholder="Image URL"
                      className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[11px] font-bold uppercase rounded-lg hover:bg-neutral-800 cursor-pointer">
                      <Upload className="w-3 h-3" /> Upload Local Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleBannerImageUpload('rightImage', e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="bannerActive"
                checked={bannerData.isActive}
                onChange={(e) => setBannerData({ ...bannerData, isActive: e.target.checked })}
                className="w-5 h-5 text-black rounded border-neutral-300 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="bannerActive" className="text-sm font-bold uppercase text-black cursor-pointer">
                Display this promotional offer banner on the public Homepage
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100">
              <button
                type="submit"
                disabled={isSavingBanner}
                className="px-8 py-3.5 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSavingBanner ? 'Saving Banner...' : 'Save & Publish Offer Banner'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h2 className="text-xl font-bold font-display uppercase tracking-tight text-black">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-black transition-colors text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-black focus:border-black focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-xs font-bold text-black focus:border-black focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Min Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1.5">
                    Valid Until Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-xs font-mono font-bold text-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold uppercase text-black cursor-pointer">
                  Activate this coupon immediately
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-black hover:bg-neutral-50 uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
