import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../../services/api';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/uiSlice';
import { Input } from '../../components/ui/Input';
import { SEO } from '../../components/seo/SEO';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !String(email).trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter your account email address.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      setIsSubmitted(true);
      if (res.data.devResetUrl) {
        setDevResetUrl(res.data.devResetUrl);
      }
      dispatch(addToast({ type: 'success', message: res.data.message }));
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to send reset link.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans flex items-stretch">
      <SEO title="Forgot Password" noIndex={true} />

      {/* Left Column: Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#171C1B] text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=85"
            alt="Football Heritage"
            className="w-full h-full object-cover object-center filter contrast-105 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171C1B] via-[#171C1B]/80 to-transparent" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <img
              src="/images/logo.png"
              alt="GOALZA Logo"
              className="w-8 h-8 object-contain brightness-0 invert drop-shadow-sm"
            />
            <span className="text-3xl font-normal text-white font-display tracking-tight uppercase">
              GOALZA<span className="text-[#FF5722] animate-pulse">.</span>
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
              <strong className="block text-white font-medium">End-to-End Account Protection</strong>
              Reset tokens expire in 15 minutes and are cryptographically hashed for security.
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-neutral-400 font-mono">
          <span>SECURE 256-BIT ENCRYPTION</span>
        </div>
      </div>

      {/* Right Column: Reset Request Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-16 lg:p-20 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-black mb-4">
              <KeyRound className="w-6 h-6 text-[#FF5722]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-black font-display uppercase tracking-tight">
              RESET YOUR PASSWORD
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-sans">
              Enter your registered email address and we will generate a secure reset link.
            </p>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4"
            >
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <h3 className="text-sm font-bold">Reset Link Dispatched</h3>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed font-sans">
                If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password. The link will remain active for 15 minutes.
              </p>

              {devResetUrl && (
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-300 text-[11px] font-mono break-all text-neutral-800 space-y-1">
                  <span className="font-bold text-neutral-900 block">⚡ Dev Mode Direct Reset Link:</span>
                  <Link to={devResetUrl.replace('http://localhost:5173', '')} className="text-blue-600 underline">
                    {devResetUrl}
                  </Link>
                </div>
              )}

              <Link
                to="/login"
                className="block text-center w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Return to Sign In
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="pl-10"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Link...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
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

