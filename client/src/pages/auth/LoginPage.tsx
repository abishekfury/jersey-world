import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, sendOtp, verifyOtpAndLogin, googleLogin } from '../../store/authSlice';
import { addToast } from '../../store/uiSlice';
import { Input } from '../../components/ui/Input';
import { CustomerReviewPill } from '../../components/ui/CustomerReviewPill';

export const LoginPage: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // OTP State
  const [otpStep, setOtpStep] = useState<'email' | 'code' | 'profile'>('email');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState<boolean>(true);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Resend Countdown
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Standard Password Sign In
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#FF5722', '#171C1B'],
      });
      dispatch(addToast({ type: 'success', message: 'Logged in successfully!' }));
      navigate(redirectUrl);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !String(email).trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter a valid email address.' }));
      return;
    }

    const result = await dispatch(sendOtp(email));
    if (sendOtp.fulfilled.match(result)) {
      const payload: any = result.payload;
      setIsExistingUser(payload.isExistingUser ?? true);
      setDevCode(payload.devOtp || '123456');
      setOtpStep('code');
      setResendTimer(45);
      dispatch(
        addToast({
          type: 'success',
          message: `Verification code sent to ${email}`,
        })
      );
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  };

  // Step 2: Handle OTP input change & auto-advance
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpValues];
    newOtp[index] = val.slice(-1);
    setOtpValues(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste for full 6 digits
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtpValues(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Step 3: Verify OTP and Login / Create Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length < 6) {
      dispatch(addToast({ type: 'warning', message: 'Please enter the complete 6-digit code.' }));
      return;
    }

    if (!isExistingUser && !name.trim()) {
      setOtpStep('profile');
      return;
    }

    const result = await dispatch(
      verifyOtpAndLogin({
        email,
        otp: fullOtp,
        name: name.trim() || undefined,
      })
    );

    if (verifyOtpAndLogin.fulfilled.match(result)) {
      confetti({
        particleCount: 65,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#FF5722', '#171C1B', '#FACC15'],
      });
      dispatch(addToast({ type: 'success', message: 'Verified! Welcome to Jersey World.' }));
      navigate(redirectUrl);
    }
  };

  // Google One-Tap / OAuth Sign In
  const handleGoogleSignIn = async () => {
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

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#171C1B] font-sans flex items-stretch">
      {/* Left Column: Visual Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#171C1B] text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Background Image with Ambient Lighting Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=85"
            alt="Football and Streetwear Culture"
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

        {/* Middle Value Proposition & Reviews */}
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
              CRAFTED FOR CHAMPIONS. WORN BY LEGENDS.
            </h2>
            <p className="text-xs xl:text-sm text-neutral-300 font-medium leading-relaxed">
              Experience India’s premier destination for authentic player-grade jerseys, custom name & number printing, and historic football collectibles.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Truck className="w-4 h-4 text-[#FF5722] shrink-0" />
              <span className="text-xs font-medium text-neutral-200">Express Delivery in 2-4 Days</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-[#FF5722] shrink-0" />
              <span className="text-xs font-medium text-neutral-200">100% Official Club Tags</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-400 font-mono border-t border-white/10 pt-4">
          <span>© 2026 JERSEY WORLD INDIA</span>
          <span>SECURE 256-BIT ENCRYPTION</span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-16 lg:p-20 relative bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Public Store & Switch Link */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>

            <Link
              to={`/register?redirect=${redirectUrl}`}
              className="text-xs font-semibold uppercase tracking-wider text-[#FF5722] hover:underline"
            >
              Create Account →
            </Link>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-normal text-[#171C1B] font-display uppercase tracking-tight">
              SIGN IN
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Access your orders, saved match kits wishlist, and express checkout.
            </p>
          </div>

          {/* Google Sign-In One-Click Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
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
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-mono uppercase text-neutral-400">
              or continue with email
            </span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          {/* Auth Method Switcher (OTP vs Password) */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-bold uppercase tracking-wider font-mono">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setOtpStep('email');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMethod === 'otp'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Email OTP Code
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Password
            </button>
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

          {/* ── OPTION A: EMAIL OTP SIGN IN FLOW ── */}
          {authMethod === 'otp' && (
            <div className="space-y-4">
              {otpStep === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                      Your Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="e.g. alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
                      required
                      className="w-full text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{isLoading ? 'SENDING CODE...' : 'SEND VERIFICATION CODE'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </form>
              )}

              {otpStep === 'code' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Code sent to {email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpStep('email')}
                      className="block mx-auto text-[11px] text-[#FF5722] font-semibold hover:underline"
                    >
                      Change Email
                    </button>
                  </div>

                  {/* 6-Digit OTP Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-2.5 pt-2" onPaste={handleOtpPaste}>
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono border-2 border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/10 rounded-xl bg-white transition-all text-black outline-none"
                      />
                    ))}
                  </div>

                  {/* Fast Test Autofill Helper */}
                  {devCode && (
                    <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-mono text-[11px]">
                        Dev Code: <strong className="text-black">{devCode}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = devCode.split('');
                          setOtpValues(digits);
                          otpInputRefs.current[5]?.focus();
                        }}
                        className="text-[11px] text-[#FF5722] font-bold hover:underline"
                      >
                        Auto-fill Code
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{isLoading ? 'VERIFYING...' : 'VERIFY & SIGN IN'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <div className="text-center pt-1">
                    {resendTimer > 0 ? (
                      <span className="text-xs text-neutral-400 font-mono">
                        Resend code in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-xs text-black font-bold uppercase tracking-wider hover:text-[#FF5722] transition-colors inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>
                </form>
              )}

              {otpStep === 'profile' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1 text-center">
                    <span className="text-xs font-mono uppercase text-[#FF5722] font-bold">
                      Almost Done!
                    </span>
                    <h3 className="text-lg font-bold text-black">Create Your Matchwear Profile</h3>
                    <p className="text-xs text-neutral-500">
                      Enter your full name to personalize your orders and club locker.
                    </p>
                  </div>

                  <Input
                    placeholder="e.g. Alex Sterling"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="w-4 h-4 text-neutral-400" />}
                    required
                    className="w-full text-sm"
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{isLoading ? 'COMPLETING...' : 'COMPLETE & ENTER STORE'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── OPTION B: STANDARD PASSWORD FLOW ── */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
                  required
                  className="w-full text-sm"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                    Password
                  </label>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
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

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-300 text-black focus:ring-black accent-black w-4 h-4"
                  />
                  <span className="text-neutral-600 font-medium">Remember for 30 days</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('otp');
                    setOtpStep('email');
                  }}
                  className="text-neutral-500 font-medium hover:text-[#FF5722] cursor-pointer"
                >
                  Forgot password? Use OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-black hover:bg-[#FF5722] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{isLoading ? 'SIGNING IN...' : 'SIGN IN TO ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
          )}

          {/* Register Footer */}
          <div className="pt-4 text-center border-t border-neutral-200">
            <p className="text-xs text-neutral-500 font-medium">
              Don't have an account yet?{' '}
              <Link
                to={`/register?redirect=${redirectUrl}`}
                className="text-[#FF5722] font-bold hover:underline"
              >
                Create Account Free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
