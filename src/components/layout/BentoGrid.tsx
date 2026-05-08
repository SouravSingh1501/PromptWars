'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface BentoGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function BentoGrid({ children, columns = 3, className = '' }: BentoGridProps) {
  const colClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClass[columns]} gap-4 ${className}`}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3;
  rowSpan?: 1 | 2 | 3;
  className?: string;
}

export function BentoItem({ children, span = 1, rowSpan = 1, className = '' }: BentoItemProps) {
  const colSpan = {
    1: '',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
  }[span];

  const rSpan = {
    1: '',
    2: 'md:row-span-2',
    3: 'md:row-span-3',
  }[rowSpan];

  return (
    <div className={`${colSpan} ${rSpan} ${className}`}>
      {children}
    </div>
  );
}
