import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser } from '../../store/authSlice';
import { addToast } from '../../store/uiSlice';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/';

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: 'Logged in successfully!' }));
      navigate(redirectUrl);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    const result = await dispatch(loginUser({ email: demoEmail, password: demoPass }));
    if (loginUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: 'Welcome to Jersey World!' }));
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
            SIGN IN TO JERSEY WORLD
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Access your order history, delivery tracking, and exclusive match kits
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="••••••••"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#FF5722] hover:bg-[#e04816] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        {/* 1-Click Evaluation Demo Logins */}
        <div className="pt-4 border-t border-gray-200 space-y-2.5">
          <span className="text-[10px] font-mono uppercase text-gray-400 block text-center tracking-wider">
            One-Click Evaluation Accounts
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer@jerseyworld.com', 'Customer@12345')}
              className="py-3 px-3 bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@jerseyworld.com', 'Admin@12345')}
              className="py-3 px-3 bg-black hover:bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${redirectUrl}`} className="text-[#FF5722] font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};
