import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none';

  const variants = {
    primary:
      'bg-neon-lime text-black hover:bg-[#b8e600] font-bold shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]',
    gold: 'bg-gold-500 text-black hover:bg-gold-400 font-bold shadow-[0_0_20px_rgba(234,179,8,0.25)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]',
    secondary: 'bg-surface-100 text-white hover:bg-surface-50 border border-white/10 hover:border-white/20',
    outline: 'border-2 border-white/20 text-white hover:border-neon-lime hover:text-neon-lime hover:bg-neon-lime/5',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
    danger: 'bg-red-600/90 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg font-bold gap-3 uppercase tracking-wider',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        leftIcon && <span className="flex items-center">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;
