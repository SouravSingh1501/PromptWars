'use client';
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'amber' | 'red' | 'green' | 'default';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const colors = {
  cyan: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
  purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20',
  amber: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
  red: 'bg-neon-red/10 text-neon-red border-neon-red/20',
  green: 'bg-neon-green/10 text-neon-green border-neon-green/20',
  default: 'bg-white/5 text-obsidian-300 border-white/10',
};

export default function Badge({ children, variant = 'default', size = 'sm', pulse, className = '' }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 border rounded-full font-medium
      ${colors[variant]}
      ${size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}
      ${className}
    `}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variant === 'red' ? 'bg-neon-red' : variant === 'amber' ? 'bg-neon-amber' : 'bg-neon-cyan'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${variant === 'red' ? 'bg-neon-red' : variant === 'amber' ? 'bg-neon-amber' : 'bg-neon-cyan'}`} />
        </span>
      )}
      {children}
    </span>
  );
}
