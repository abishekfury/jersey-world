import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Check } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchCurrentUser } from '../../store/authSlice';
import { addToast } from '../../store/uiSlice';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const AddressesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const addresses = user?.addresses || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: user?.phone || '',
    isDefault: true,
  });

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/addresses', formData);
      dispatch(fetchCurrentUser());
      setIsAddModalOpen(false);
      dispatch(addToast({ type: 'success', message: 'Address saved!' }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: 'Failed to add address.' }));
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await api.delete(`/auth/addresses/${addressId}`);
      dispatch(fetchCurrentUser());
      dispatch(addToast({ type: 'success', message: 'Address deleted.' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to delete address.' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-display uppercase tracking-wider">
          Saved Shipping Addresses
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4 text-black" />}
        >
          ADD NEW ADDRESS
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className="p-5 bg-surface-200 border border-white/10 rounded-2xl space-y-2 relative"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white">{addr.fullName}</h4>
              {addr.isDefault && <Badge variant="gold" size="sm">DEFAULT</Badge>}
            </div>
            <p className="text-xs text-gray-300">
              {addr.street} {addr.apartment && `, ${addr.apartment}`}
            </p>
            <p className="text-xs text-gray-400">
              {addr.city}, {addr.state} - {addr.postalCode}
            </p>
            <p className="text-[11px] text-gray-500 font-mono">Phone: {addr.phone}</p>

            <button
              onClick={() => handleDeleteAddress(addr._id!)}
              className="text-xs text-red-400 hover:underline pt-2 inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="ADD NEW DELIVERY ADDRESS"
        maxWidth="lg"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <Input
            label="Recipient Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Street Address"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="PIN Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            SAVE ADDRESS
          </Button>
        </form>
      </Modal>
    </div>
  );
};
