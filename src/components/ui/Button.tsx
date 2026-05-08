'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: 'bg-gradient-to-r from-neon-cyan/90 to-neon-green/80 text-obsidian-950 font-semibold hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] active:scale-[0.97]',
  secondary: 'glass border-white/10 text-white hover:bg-white/10 active:scale-[0.97]',
  ghost: 'bg-transparent text-obsidian-400 hover:text-white hover:bg-white/5 active:scale-[0.97]',
  danger: 'bg-neon-red/20 text-neon-red border border-neon-red/30 hover:bg-neon-red/30 active:scale-[0.97]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-8 py-3.5 text-base rounded-xl gap-2.5',
};

export default function Button({ variant = 'primary', size = 'md', loading, icon, children, disabled, className = '', ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`
        inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
