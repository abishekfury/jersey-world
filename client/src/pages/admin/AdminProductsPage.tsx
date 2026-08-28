import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Shirt, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { IProduct } from '@shared/types';
import { adminService } from '../../services/api';
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
    description: 'Official Liverpool FC match edition jersey crafted with high-performance breathable fabric.',
    price: 4999,
    discountPrice: 4299,
    totalStock: 50,
    images: {
      front: '',
      back: '',
      detail: '',
      lifestyle: '',
    },
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
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
    adminService
      .getProducts({ limit: 50 })
      .then((res: any) => setProducts(res.data.products))
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
        dispatch(addToast({ type: 'success', message: 'Jersey updated successfully!' }));
      } else {
        await adminService.createProduct(formData);
        dispatch(addToast({ type: 'success', message: 'New jersey added to catalog!' }));
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

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black font-display uppercase tracking-tight">
            FOOTBALL KITS & INVENTORY
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage match kits, size allocations, stock inventory, and club details
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData(defaultForm);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF5722] hover:bg-[#e04816] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> ADD NEW JERSEY
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="text-xs uppercase font-bold bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4">Jersey Name</th>
                <th className="p-4">Club / Nation</th>
                <th className="p-4">Season</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Total Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((prod) => (
                <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3.5">
                    <div className="w-14 h-16 bg-[#ECEAE4] rounded-xl p-1.5 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 shadow-xs">
                      {prod.images?.front ? (
                        <img
                          src={prod.images.front}
                          alt={prod.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (prod.images.front.startsWith('/uploads') && !target.src.includes(':5000')) {
                              target.src = `http://localhost:5000${prod.images.front}`;
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
                      <span className="text-xs text-gray-400 font-mono">ID: #{prod._id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-black text-sm">{prod.team}</td>
                  <td className="p-4 text-gray-700 font-mono font-medium text-sm">{prod.season}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-gray-100 text-gray-800 border border-gray-200">
                      {prod.type}
                    </span>
                  </td>
                  <td className="p-4 font-black text-black font-mono text-base">
                    ₹{(prod.discountPrice || prod.price).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 font-mono font-bold text-sm">
                    <span className={prod.totalStock < 15 ? 'text-red-600 font-black' : 'text-black'}>
                      {prod.totalStock} units
                    </span>
                  </td>
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
                      className="p-2.5 hover:bg-gray-100 rounded-xl text-black transition-colors"
                      title="Edit Jersey"
                    >
                      <Edit className="w-4 h-4" />
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
              ))}
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
                { key: 'front', label: '1. Front View', required: true },
                { key: 'back', label: '2. Back View', required: false },
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
                              if (currentImg.startsWith('/uploads') && !target.src.includes(':5000')) {
                                target.src = `http://localhost:5000${currentImg}`;
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              Homepage Sections Allocation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={formData.isFeatured || false}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-[#FF5722] focus:ring-[#FF5722] border-gray-300 rounded"
                />
                <div>
                  <span className="text-[11px] font-bold block text-black">Trending Now</span>
                  <span className="text-[9px] text-gray-500">Show in main trending list</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller || false}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  className="w-4 h-4 text-[#FF5722] focus:ring-[#FF5722] border-gray-300 rounded"
                />
                <div>
                  <span className="text-[11px] font-bold block text-black">Most Popular</span>
                  <span className="text-[9px] text-gray-500">Show in Most Popular Kits</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival || false}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="w-4 h-4 text-[#FF5722] focus:ring-[#FF5722] border-gray-300 rounded"
                />
                <div>
                  <span className="text-[11px] font-bold block text-black">New Arrival</span>
                  <span className="text-[9px] text-gray-500">Show in New Arrivals</span>
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
