import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser, googleLogin } from '../../store/authSlice';
import { addToast } from '../../store/uiSlice';
import { Input } from '../../components/ui/Input';
import { CustomerReviewPill } from '../../components/ui/CustomerReviewPill';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleGoogleSignUp = async () => {
    const defaultGoogleProfile = {
      name: 'Football Collector',
      email: 'collector@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      googleId: 'google_' + Math.random().toString(36).substring(2, 10),
    };

    const result = await dispatch(googleLogin(defaultGoogleProfile));
    if (googleLogin.fulfilled.match(result)) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
      });
      dispatch(addToast({ type: 'success', message: 'Signed in with Google!' }));
      navigate(redirectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      dispatch(addToast({ type: 'warning', message: 'Please agree to the Terms & Conditions.' }));
      return;
    }

    if (password.length < 6) {
      dispatch(addToast({ type: 'error', message: 'Password must be at least 6 characters long.' }));
      return;
    }

    const result = await dispatch(
      registerUser({
        name,
        email,
        password,
        phone: phone || undefined,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF5722', '#171C1B', '#FACC15'],
      });
      dispatch(addToast({ type: 'success', message: 'Account created! Welcome to Jersey World.' }));
      navigate(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans flex items-stretch">
      {/* Left Column: Visual Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#171C1B] text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Background Image with Ambient Lighting Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=85"
            alt="Matchwear Football Culture"
            className="w-full h-full object-cover object-center filter contrast-105 opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171C1B] via-[#171C1B]/80 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#171C1B]/60 to-[#171C1B]" />
        </div>

        {/* Top Branding Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-1.5 group">
            <span className="text-3xl font-normal text-white font-display tracking-tight uppercase">
              JERSEY WORLD<span className="text-[#FF5722] animate-pulse">.</span>
            </span>
          </Link>
          <span className="block text-xs font-mono text-neutral-400 uppercase tracking-widest mt-1">
            OFFICIAL MATCHWEAR & RETRO KITS
          </span>
        </div>

        {/* Middle Value Proposition & Member Benefits */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <CustomerReviewPill
            variant="glass"
            rating="4.95"
            totalReviews="1K reviews"
            subtext="Trusted by 1000+ customers"
            className="shadow-2xl backdrop-blur-md"
          />

          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-normal text-white uppercase font-display tracking-tight leading-tight">
              JOIN INDIA’S #1 JERSEY DESTINATION.
            </h2>
            <p className="text-xs xl:text-sm text-neutral-300 font-medium leading-relaxed">
              Create an account to unlock member discounts, custom name & number printing, and instant size exchange privileges.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Tag className="w-4 h-4 text-[#FF5722] shrink-0" />
              <span className="text-xs font-medium text-neutral-200">Exclusive Promo Vouchers</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <RotateCcw className="w-4 h-4 text-[#FF5722] shrink-0" />
              <span className="text-xs font-medium text-neutral-200">7-Day Free Size Exchange</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-400 font-mono border-t border-white/10 pt-4">
          <span>© 2026 JERSEY WORLD INDIA</span>
          <span>SECURE 256-BIT ENCRYPTION</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-14 lg:p-16 relative bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Public Store */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>

            <Link
              to={`/login?redirect=${redirectUrl}`}
              className="text-xs font-semibold uppercase tracking-wider text-[#FF5722] hover:underline"
            >
              Sign In Instead →
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-normal text-[#171C1B] font-display uppercase tracking-tight">
              CREATE ACCOUNT
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Join thousands of football collectors and unlock your personal matchwear locker.
            </p>
          </div>

          {/* Google Sign-Up One-Click Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full py-3.5 px-4 border border-neutral-300 hover:border-black rounded-xl bg-white hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-800 transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer active:scale-[0.99]"
          >
            {/* Google Multicolored SVG Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign Up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-mono uppercase text-neutral-400">
              or register with email
            </span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                Full Name
              </label>
              <Input
                placeholder="e.g. Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-neutral-400" />}
                required
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
                required
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                Mobile Number (Optional)
              </label>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-neutral-400" />}
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-neutral-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
                className="w-full text-sm"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 mt-0.5"
                />
                <span>
                  I agree to the{' '}
                  <span className="text-black font-semibold underline">Terms of Service</span> and{' '}
                  <span className="text-black font-semibold underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer mt-2"
            >
              <span>{isLoading ? 'CREATING ACCOUNT...' : 'CREATE MY ACCOUNT'}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>

          {/* Sign In Footer */}
          <div className="pt-2 text-center border-t border-neutral-200">
            <p className="text-xs text-neutral-500 font-medium">
              Already have an account?{' '}
              <Link
                to={`/login?redirect=${redirectUrl}`}
                className="text-[#FF5722] font-bold hover:underline"
              >
                Sign In to Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
