import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Shirt,
  Image as ImageIcon,
  Upload,
  Loader2,
  Search,
  Star,
  Sparkles,
  Flame,
  Check,
  Globe,
} from 'lucide-react';
import { IProduct } from '@shared/types';
import { adminService, SERVER_ORIGIN } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToast } from '../../store/uiSlice';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [uploadingView, setUploadingView] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'popular' | 'newArrival' | 'epl' | 'laliga'>('all');

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const defaultForm = {
    name: '',
    team: 'Liverpool',
    country: 'England',
    league: 'Premier League',
    season: '2026/27',
    type: 'Home',
    description: 'Official match edition jersey crafted with high-performance breathable fabric.',
    price: 999,
    discountPrice: 799,
    totalStock: 50,
    images: {
      front: '',
      back: '',
      detail: '',
      lifestyle: '',
    },
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
  };

  const [formData, setFormData] = useState<any>(defaultForm);

  const compressAndReadImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
            resolve(dataUrl);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = () => resolve('');
    });
  };

  const handleFileUpload = async (viewKey: string, file: File) => {
    if (!file) return;
    setUploadingView(viewKey);
    try {
      const localDataUrl = await compressAndReadImage(file);

      if (localDataUrl) {
        setFormData((prev: any) => ({
          ...prev,
          images: {
            ...prev.images,
            [viewKey]: localDataUrl,
          },
        }));
        dispatch(addToast({ type: 'success', message: `${viewKey.toUpperCase()} image loaded successfully!` }));
      }
    } catch {
      dispatch(addToast({ type: 'error', message: `Could not process ${viewKey} image.` }));
    } finally {
      setUploadingView(null);
    }
  };

  const loadProducts = () => {
    setIsLoading(true);
    adminService
      .getProducts({ limit: 100 })
      .then((res: any) => setProducts(res.data.products || []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, formData);
        dispatch(addToast({ type: 'success', message: 'Jersey updated successfully! Changes are live on homepage.' }));
      } else {
        await adminService.createProduct(formData);
        dispatch(addToast({ type: 'success', message: 'New jersey added to catalog & homepage!' }));
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData(defaultForm);
      loadProducts();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to save product.' }));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this football jersey?')) return;
    try {
      await adminService.deleteProduct(id);
      dispatch(addToast({ type: 'info', message: 'Jersey removed from catalog.' }));
      loadProducts();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete product.' }));
    }
  };

  const handleToggleHomepageFlag = async (
    prod: IProduct,
    flag: 'isBestSeller' | 'isNewArrival' | 'isFeatured'
  ) => {
    const nextVal = !prod[flag];
    try {
      await adminService.updateProduct(prod._id, { [flag]: nextVal });
      setProducts((prev) =>
        prev.map((p) => (p._id === prod._id ? { ...p, [flag]: nextVal } : p))
      );
      dispatch(
        addToast({
          type: 'success',
          message: `Homepage placement updated for "${prod.name}"!`,
        })
      );
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update homepage status.' }));
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.team.toLowerCase().includes(q) ||
        prod.league?.toLowerCase().includes(q) ||
        prod.season?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterTab === 'popular') return Boolean(prod.isBestSeller);
      if (filterTab === 'newArrival') return Boolean(prod.isNewArrival);
      if (filterTab === 'epl') return prod.league === 'Premier League';
      if (filterTab === 'laliga') return prod.league === 'La Liga';

      return true;
    });
  }, [products, searchQuery, filterTab]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black font-display uppercase tracking-tight">
            FOOTBALL KITS & HOMEPAGE CATALOG
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage jersey names, photos, stock, and configure which jerseys display on the public Homepage
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData(defaultForm);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF5722] hover:bg-[#e04816] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> ADD NEW JERSEY
        </button>
      </div>

      {/* Guide Banner for Admin */}
      <div className="bg-[#FAF9F5] border border-neutral-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-[#FF5722]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase text-black font-sans">
              How to manage Homepage Jersey Showcase
            </h4>
            <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
              • To change a jersey's name or pictures on the homepage: click <span className="font-bold text-black">Edit (✏️)</span> and update the title or photo URL/upload.<br />
              • Toggle <span className="font-bold text-amber-700">★ Most Popular</span> to showcase under Most Popular Kits, or <span className="font-bold text-blue-700">⚡ New Season</span> to showcase under 2026/27 drops.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
              filterTab === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            All Kits ({products.length})
          </button>
          <button
            onClick={() => setFilterTab('popular')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
              filterTab === 'popular'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-amber-50'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Homepage: Most Popular ({products.filter((p) => p.isBestSeller).length})
          </button>
          <button
            onClick={() => setFilterTab('newArrival')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
              filterTab === 'newArrival'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-blue-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Homepage: New Season ({products.filter((p) => p.isNewArrival).length})
          </button>
          <button
            onClick={() => setFilterTab('epl')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
              filterTab === 'epl'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-purple-50'
            }`}
          >
            Premier League ({products.filter((p) => p.league === 'Premier League').length})
          </button>
          <button
            onClick={() => setFilterTab('laliga')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
              filterTab === 'laliga'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-red-50'
            }`}
          >
            La Liga ({products.filter((p) => p.league === 'La Liga').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kits, club, league..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="text-xs uppercase font-bold bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4">Jersey Name & Photo</th>
                <th className="p-4">Club / League</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Homepage Placement</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 italic">
                    No jerseys match this filter. Add a new jersey or adjust search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                    {/* Jersey Name & Thumbnail */}
                    <td className="p-4 flex items-center gap-3.5">
                      <div className="w-14 h-16 bg-[#ECEAE4] rounded-xl p-1.5 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 shadow-xs">
                        {prod.images?.front ? (
                          <img
                            src={prod.images.front}
                            alt={prod.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (
                                prod.images.front.startsWith('/uploads') &&
                                !target.src.includes(':5000') &&
                                !target.src.includes('http')
                              ) {
                                const baseUrl = SERVER_ORIGIN;
                                target.src = `${baseUrl}${prod.images.front}`;
                              } else {
                                target.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <Shirt className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-black text-sm sm:text-base line-clamp-1">{prod.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400 font-mono">ID: #{prod._id.slice(-6)}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                            {prod.season} · {prod.type}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Club / League */}
                    <td className="p-4">
                      <p className="font-semibold text-black text-sm">{prod.team}</p>
                      <span className="text-xs text-neutral-500">{prod.league || prod.country}</span>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-black font-mono text-base">
                      ₹{(prod.discountPrice || prod.price).toLocaleString('en-IN')}
                    </td>

                    {/* Stock */}
                    <td className="p-4 font-mono font-bold text-sm">
                      <span className={prod.totalStock < 15 ? 'text-red-600 font-black' : 'text-black'}>
                        {prod.totalStock} units
                      </span>
                    </td>

                    {/* Homepage Placement Badges & 1-Click Quick Toggles */}
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleHomepageFlag(prod, 'isBestSeller')}
                          title="Click to toggle Most Popular Kits showcase on Homepage"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            prod.isBestSeller
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200 hover:text-neutral-700'
                          }`}
                        >
                          <Star className="w-3 h-3" />
                          {prod.isBestSeller ? 'Most Popular' : '+ Popular'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleHomepageFlag(prod, 'isNewArrival')}
                          title="Click to toggle New Season 26/27 showcase on Homepage"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            prod.isNewArrival
                              ? 'bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200 hover:text-neutral-700'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {prod.isNewArrival ? 'New Season' : '+ New Season'}
                        </button>

                        {prod.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-purple-100 text-purple-900 border border-purple-300">
                            <Flame className="w-3 h-3 text-purple-700" /> Trending
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setFormData({
                            ...prod,
                            isFeatured: prod.isFeatured || false,
                            isNewArrival: prod.isNewArrival || false,
                            isBestSeller: prod.isBestSeller || false,
                            images: {
                              front: prod.images?.front || '',
                              back: prod.images?.back || '',
                              detail: prod.images?.detail || '',
                              lifestyle: prod.images?.lifestyle || '',
                            },
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2.5 hover:bg-gray-100 rounded-xl text-black transition-colors inline-flex items-center gap-1 font-bold text-xs"
                        title="Edit Jersey Name, Images & Details"
                      >
                        <Edit className="w-4 h-4 text-neutral-800" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-2.5 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                          title="Delete Jersey"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'EDIT FOOTBALL JERSEY' : 'ADD NEW FOOTBALL JERSEY'}
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-5">
          <Input
            label="Jersey Title / Edition Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Liverpool FC 2026/27 Anfield Legacy Home Edition"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Team / Club"
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              placeholder="e.g. Liverpool"
              required
            />
            <Input
              label="Season / Year"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              placeholder="e.g. 2026/27 or 1998"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (INR ₹)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
            <Input
              label="Discount Price (INR ₹)"
              type="number"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
            />
            <Input
              label="Initial Stock Quantity"
              type="number"
              value={formData.totalStock}
              onChange={(e) => setFormData({ ...formData, totalStock: Number(e.target.value) })}
              required
            />
          </div>

          {/* Multi-Image Gallery with Local File Upload and URL support */}
          <div className="pt-2 border-t border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#FF5722]" /> Product Photo Gallery (Upload Local Images or URLs)
              </h4>
              <span className="text-[10px] text-gray-500 font-medium">
                Select photos from your device or paste web URLs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'front', label: '1. Front View (Main Homepage Card Photo)', required: true },
                { key: 'back', label: '2. Back View (Homepage Hover Flip Photo)', required: false },
                { key: 'detail', label: '3. Badge / Detail View', required: false },
                { key: 'lifestyle', label: '4. Lifestyle / Pitch View', required: false },
              ].map(({ key, label, required }) => {
                const currentImg = formData.images?.[key] || '';
                const isUploading = uploadingView === key;

                return (
                  <div key={key} className="space-y-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-black text-[11px]">
                        {label} {required && <span className="text-red-500">*</span>}
                      </span>
                      {currentImg && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev: any) => ({
                              ...prev,
                              images: { ...prev.images, [key]: '' },
                            }))
                          }
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Image Preview Box & Local Dropzone */}
                    <div className="relative group w-full h-32 bg-[#ECEAE4] rounded-xl overflow-hidden border border-dashed border-gray-300 hover:border-black flex flex-col items-center justify-center transition-all">
                      {currentImg ? (
                        <>
                          <img
                            src={currentImg}
                            alt={`${label} Preview`}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (currentImg.startsWith('/uploads') && !target.src.includes(':5000') && !target.src.includes('http')) {
                                const baseUrl = SERVER_ORIGIN;
                                target.src = `${baseUrl}${currentImg}`;
                              }
                            }}
                          />

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer px-3 py-1.5 bg-white text-black font-bold text-[10px] uppercase rounded-lg shadow hover:bg-[#FF5722] hover:text-white transition-colors">
                              Change Local Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(key, file);
                                }}
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-3 text-center space-y-1">
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <Loader2 className="w-6 h-6 animate-spin text-[#FF5722]" />
                              <span className="text-[10px] font-bold text-neutral-600">Uploading Image...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                              <span className="text-[11px] font-bold text-black group-hover:text-[#FF5722] transition-colors">
                                Click to Upload Local Image
                              </span>
                              <span className="text-[9px] text-gray-400">PNG, JPG, WEBP up to 10MB</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(key, file);
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Or URL input */}
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Or paste web image URL..."
                        value={currentImg}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            images: { ...prev.images, [key]: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Homepage Sections Allocation Toggles */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#FF5722]" /> Homepage Placement & Showcase
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Check where this jersey should appear on the public Homepage. Changes apply immediately upon saving.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-start gap-3 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/60 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller || false}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold block text-amber-950">★ Most Popular Kits</span>
                  <span className="text-[10px] text-amber-800 leading-snug block mt-0.5">
                    Showcases in the "MOST POPULAR KITS" row on the Homepage
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100/60 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival || false}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold block text-blue-950">⚡ New Season 26/27</span>
                  <span className="text-[10px] text-blue-800 leading-snug block mt-0.5">
                    Showcases in the "NEW SEASON 26/27" drop row on the Homepage
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl cursor-pointer hover:bg-purple-100/60 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={formData.isFeatured || false}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold block text-purple-950">🔥 Trending Highlight</span>
                  <span className="text-[10px] text-purple-800 leading-snug block mt-0.5">
                    Mark as trending kit for shop badges and search filters
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-4 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow"
            >
              {editingProduct ? 'SAVE CHANGES' : 'PUBLISH JERSEY TO STORE'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
