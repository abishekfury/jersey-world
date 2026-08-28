import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser } from '../../store/authSlice';
import { addToast } from '../../store/uiSlice';
import { Input } from '../../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ name, email, password, phone }));
    if (registerUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: 'Account created! Welcome to Jersey World.' }));
      navigate(redirectUrl);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-white text-black">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722]">
            <Sparkles className="w-6 h-6 fill-[#FF5722]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black font-display uppercase tracking-tight">
            CREATE AN ACCOUNT
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Join Jersey World for instant 3D fittings and fast order tracking
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rohan Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 chars"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#FF5722] hover:bg-[#e04816] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirectUrl}`} className="text-[#FF5722] font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
