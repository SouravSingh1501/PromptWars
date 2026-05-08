'use client';
import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'neon-cyan' | 'neon-purple';
  hover?: boolean;
  padding?: string;
}

const variantStyles: Record<string, string> = {
  default: 'glass',
  elevated: 'glass shadow-2xl',
  'neon-cyan': 'glass neon-glow-cyan',
  'neon-purple': 'glass neon-glow-purple',
};

export default function GlassCard({ children, variant = 'default', hover = true, padding = 'p-6', className = '', ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`${variantStyles[variant]} ${hover ? 'glass-hover' : ''} ${padding} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
