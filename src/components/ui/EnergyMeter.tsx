'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { getBatteryColor, getBatteryStatus } from '@/lib/fatigue';

interface EnergyMeterProps {
  level: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function EnergyMeter({ level, showLabel = true, size = 'md' }: EnergyMeterProps) {
  const color = getBatteryColor(level);
  const status = getBatteryStatus(level);
  const clampedLevel = Math.max(0, Math.min(100, level));

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-obsidian-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
              <line x1="23" y1="13" x2="23" y2="11" />
            </svg>
            Energy
          </span>
          <span className="text-xs font-semibold" style={{ color }}>{status} · {clampedLevel}%</span>
        </div>
      )}
      <div className={`w-full bg-white/5 rounded-full overflow-hidden ${heights[size]}`}>
        <motion.div
          className={`${heights[size]} rounded-full`}
          style={{
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 10px ${color}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedLevel}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
