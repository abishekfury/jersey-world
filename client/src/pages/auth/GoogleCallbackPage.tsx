import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { fetchCurrentUser } from '../../store/authSlice';
import { setAuthToken } from '../../services/api';
import { addToast } from '../../store/uiSlice';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setErrorMsg('Google authentication was cancelled or failed.');
        dispatch(addToast({ type: 'error', message: 'Google authentication was cancelled or failed.' }));
        setTimeout(() => navigate('/login'), 2500);
        return;
      }

      if (token) {
        try {
          setAuthToken(token);
          const result = await dispatch(fetchCurrentUser());
          if (fetchCurrentUser.fulfilled.match(result)) {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
            });
            dispatch(addToast({ type: 'success', message: 'Successfully signed in with Google!' }));
            const redirectUrl = sessionStorage.getItem('jw_auth_redirect') || '/';
            sessionStorage.removeItem('jw_auth_redirect');
            navigate(redirectUrl);
          } else {
            setErrorMsg('Failed to initialize user session.');
            dispatch(addToast({ type: 'error', message: 'Failed to initialize session. Please sign in again.' }));
            setTimeout(() => navigate('/login'), 2000);
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Authentication error.');
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        // In case accessed without token
        setErrorMsg('No authentication token received.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processCallback();
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white border border-[#E5E2D9] rounded-2xl p-8 shadow-sm space-y-6">
        {errorMsg ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#171C1B]">Sign-In Unsuccessful</h2>
              <p className="text-sm text-neutral-600">{errorMsg}</p>
            </div>
            <p className="text-xs text-neutral-400">Redirecting you back to login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#171C1B] flex items-center justify-center mx-auto animate-pulse">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#171C1B] font-display uppercase tracking-tight">
                Authenticating with Google
              </h2>
              <p className="text-sm text-neutral-600 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF5722]" />
                Verifying your credentials and securing your session...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default GoogleCallbackPage;

