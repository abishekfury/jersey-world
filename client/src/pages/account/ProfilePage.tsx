import React, { useState } from 'react';
import { User, Lock, Save, Shield } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchCurrentUser } from '../../store/authSlice';
import { addToast } from '../../store/uiSlice';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/auth/profile', { name, phone, avatar });
      dispatch(fetchCurrentUser());
      dispatch(addToast({ type: 'success', message: 'Profile details updated!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to update profile.' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-surface-200 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <h2 className="text-xl font-bold text-white font-display uppercase tracking-wider">
        Personal Profile & Account Security
      </h2>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address"
          value={user?.email || ''}
          disabled
          helperText="Email address cannot be changed."
        />

        <Input
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
        />

        <Input
          label="Avatar Image URL"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://..."
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4 text-black" />}
        >
          SAVE PROFILE
        </Button>
      </form>
    </div>
  );
};
