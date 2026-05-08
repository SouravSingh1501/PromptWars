'use client';
import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  variant?: 'text' | 'card' | 'circle';
}

export default function Skeleton({ className = '', lines = 1, variant = 'text' }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`glass rounded-2xl p-6 space-y-4 ${className}`}>
        <div className="shimmer h-4 w-2/3 rounded-lg" />
        <div className="shimmer h-3 w-full rounded-lg" />
        <div className="shimmer h-3 w-4/5 rounded-lg" />
        <div className="flex gap-3 mt-4">
          <div className="shimmer h-8 w-20 rounded-lg" />
          <div className="shimmer h-8 w-16 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'circle') {
    return <div className={`shimmer rounded-full aspect-square ${className}`} />;
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer h-3 rounded-lg"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}
