import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService, setAuthToken } from '../../services/api';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/uiSlice';
import { Input } from '../../components/ui/Input';
import { SEO } from '../../components/seo/SEO';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      dispatch(addToast({ type: 'error', message: 'Password must be at least 8 characters long.' }));
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      dispatch(addToast({ type: 'error', message: 'Password must include uppercase, lowercase, and a number.' }));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(addToast({ type: 'error', message: 'Passwords do not match.' }));
      return;
    }

    if (!token) {
      dispatch(addToast({ type: 'error', message: 'Invalid or missing reset token.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(token, password);
      setAuthToken(res.data.accessToken);
      setIsSuccess(true);
      dispatch(addToast({ type: 'success', message: 'Password reset successfully!' }));
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to reset password.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans flex items-stretch">
      <SEO title="Set New Password" noIndex={true} />

      {/* Left Column: Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#171C1B] text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=85"
            alt="Football and Streetwear Culture"
            className="w-full h-full object-cover object-center filter contrast-105 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171C1B] via-[#171C1B]/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-1.5 group">
            <span className="text-3xl font-normal text-white font-display tracking-tight uppercase">
              JERSEY WORLD<span className="text-[#FF5722] animate-pulse">.</span>
            </span>
          </Link>
          <span className="block text-xs font-mono text-neutral-400 uppercase tracking-widest mt-1">
            ACCOUNT SECURITY & ACCESS RECOVERY
          </span>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-[#FF5722] shrink-0" />
            <div className="text-xs text-neutral-300">
              <strong className="block text-white font-medium">Industry Standard Security</strong>
              Passwords are salted and hashed using bcrypt before being saved.
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-neutral-400 font-mono">
          <span>SECURE 256-BIT ENCRYPTION</span>
        </div>
      </div>

      {/* Right Column: New Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-16 lg:p-20 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black mb-4">
              <Lock className="w-6 h-6 text-[#FF5722]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-black font-display uppercase tracking-tight">
              CREATE NEW PASSWORD
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
              Enter and confirm your new secure account password below.
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-center"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900">Password Updated!</h3>
              <p className="text-xs text-emerald-700 font-sans">
                Your password has been changed securely. Redirecting you to the home page...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters (A-Z, a-z, 0-9)"
                    required
                    className="pl-10 pr-10"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="pl-10"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Set New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

