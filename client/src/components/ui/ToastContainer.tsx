import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { removeToast } from '../../store/uiSlice';

interface ToastItemProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  };
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 4000); // Dismiss toast automatically after 4 seconds
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#FF5722] shrink-0" />,
  };

  const borders = {
    success: 'border-green-600',
    error: 'border-red-600',
    warning: 'border-amber-600',
    info: 'border-[#FF5722]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-center justify-between p-4 bg-white rounded-2xl border-2 ${borders[toast.type]} shadow-[0_15px_35px_rgba(0,0,0,0.15)]`}
    >
      <div className="flex items-center gap-3 pr-2">
        {icons[toast.type]}
        <p className="text-xs sm:text-sm font-bold text-black leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-gray-500 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
