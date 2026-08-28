import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neon' | 'gold' | 'danger' | 'surface' | 'outline' | 'success';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'surface',
  size = 'md',
  className,
}) => {
  const base = 'inline-flex items-center font-semibold rounded-full uppercase tracking-wider transition-colors';

  const variants = {
    neon: 'bg-neon-lime/15 text-neon-lime border border-neon-lime/30',
    gold: 'bg-gold-500/15 text-gold-400 border border-gold-500/30',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    surface: 'bg-surface-50 text-gray-300 border border-white/10',
    outline: 'border border-white/20 text-gray-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return <span className={clsx(base, variants[variant], sizes[size], className)}>{children}</span>;
};
